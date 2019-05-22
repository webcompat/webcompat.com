#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Webcompat.com relies on many little functions for processing data.

We collect them in that module.
"""

from functools import update_wrapper
from functools import wraps
import hashlib
import json
import os
import re
import urllib
import urlparse

from flask import abort
from flask import g
from flask import make_response
from flask import redirect
from flask import request
from flask import session
import requests
from ua_parser import user_agent_parser

from webcompat import api
from webcompat import app
from webcompat import github

API_URI = 'https://api.github.com/'
AUTH_HEADERS = {'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN']),
                'User-Agent': 'webcompat/webcompat-bot'}
HOST_WHITELIST = ('webcompat.com', 'staging.webcompat.com',
                  '127.0.0.1', 'localhost')
FIXTURES_PATH = os.getcwd() + '/tests/fixtures'
STATIC_PATH = os.getcwd() + '/webcompat/static'
JSON_MIME = 'application/json'
REPO_URI = app.config['ISSUES_REPO_URI']

cache_dict = {}


@app.template_filter('bust_cache')
def bust_cache(file_path):
    """Jinja2 filter to add a cache busting param based on md5 checksum.

    Uses a simple cache_dict to we don't have to hash each file for every
    request. This is kept in-memory so it will be blown away when the app
    is restarted (which is when file changes would have been deployed).
    """
    def get_checksum(file_path):
        try:
            checksum = cache_dict[file_path]
        except KeyError:
            checksum = md5_checksum(file_path)
            cache_dict[file_path] = checksum
        return checksum

    return file_path + '?' + get_checksum(STATIC_PATH + file_path)


def md5_checksum(file_path):
    """Return the md5 checksum for a given file path."""
    with open(file_path, 'rb') as fh:
        m = hashlib.md5()
        while True:
            # only read in 8k of the file at a time
            data = fh.read(8192)
            if not data:
                break
            m.update(data)
        return m.hexdigest()


def get_str_value(val):
    """Map values from JSON to python."""
    details_map = {False: 'false', True: 'true', None: 'null'}
    if isinstance(val, (bool, type(None))):
        return details_map[val]
    if isinstance(val, unicode):
        return val
    return str(val)


def get_user_info():
    """Grab the username and avatar URL from GitHub."""
    if session.get('username') and session.get('avatar_url'):
        return
    else:
        gh_user = github.get('user')
        session['username'] = gh_user.get('login')
        session['avatar_url'] = gh_user.get('avatar_url')


def get_version_string(dictionary):
    """Return version string from dict.

    Used on `user_agent` or `os` dict
    with `major`, and optional `minor` and `patch`.
    Minor and patch, orderly, are added only if they exist.
    """
    version = dictionary.get('major')
    if not version:
        return ''
    minor = dictionary.get('minor')
    if not minor:
        return version
    patch = dictionary.get('patch')
    if not patch:
        return version + "." + minor
    return version + "." + minor + "." + patch


def get_name(dictionary):
    """Return name from UA or OS dictionary's `family`.

    As bizarre UA or OS strings can be parsed like so:
    {'major': None, 'minor': None, 'family': 'Other', 'patch': None}
    we return "Unknown", rather than "Other"
    """
    name = dictionary.get('family')
    if name.lower() == "other":
        name = "Unknown"
    return name


def get_browser(user_agent_string=None):
    """Return browser name family and version.

    It will pre-populate the bug reporting form.
    """
    if user_agent_string and isinstance(user_agent_string, basestring):
        ua_dict = user_agent_parser.Parse(user_agent_string)
        ua = ua_dict.get('user_agent')
        name = get_name(ua)
        # if browser is unknown, we don't need further details
        if name == "Unknown":
            return "Unknown"
        version = get_version_string(ua)
        # Check for tablet devices
        if ua_dict.get('device').get('model') == 'Tablet':
            model = '(Tablet) '
        else:
            model = ''
        rv = '{0} {1}{2}'.format(name, model, version).rstrip()
        return rv
    return "Unknown"


def get_browser_name(user_agent_string=None):
    """Return just the browser name.

    unknown user agents will be reported as "unknown".
    """
    if user_agent_string and isinstance(user_agent_string, basestring):
        # get_browser will return something like 'Chrome Mobile 47.0'
        # we just want 'chrome mobile', i.e., the lowercase name
        # w/o the version
        return get_browser(user_agent_string).rsplit(' ', 1)[0].lower()
    return "unknown"


def get_os(user_agent_string=None):
    """Return operating system name.

    It pre-populates the bug reporting form.
    """
    if user_agent_string and isinstance(user_agent_string, basestring):
        ua_dict = user_agent_parser.Parse(user_agent_string)
        os = ua_dict.get('os')
        name = get_name(os)
        # if OS is unknown, we don't need further details
        if name == "Unknown":
            return "Unknown"
        version = get_version_string(os)
        rv = '{0} {1}'.format(name, version).rstrip()
        return rv
    return "Unknown"


def get_response_headers(response):
    """Return a dictionary of headers based on a passed in Response object.

    This allows us to proxy response headers from GitHub to our own responses.
    """
    headers = {'etag': response.headers.get('etag'),
               'cache-control': response.headers.get('cache-control'),
               'content-type': JSON_MIME}

    if response.headers.get('link'):
        headers['link'] = rewrite_and_sanitize_link(
            response.headers.get('link'))
    return headers


def get_request_headers(headers, mime_type=JSON_MIME):
    """Return a dictionary of headers based on the client Request.

    This allows us to send back headers to GitHub when we are acting as client.
    """
    client_headers = {'Accept': mime_type}
    if 'If-None-Match' in headers:
        etag = headers['If-None-Match'].encode('utf-8')
        client_headers['If-None-Match'] = etag
    if 'User-Agent' in headers:
        client_headers['User-Agent'] = headers['User-Agent']
    return client_headers


def get_referer(request):
    """Return the Referer URI based on the passed in Request object.

    Also validate that it came from our own server. If it didn't, check
    the session for a manually stashed 'referer' key, otherwise return None.
    """
    if request.referrer:
        host = urlparse.urlparse(request.referrer).hostname
        if host in HOST_WHITELIST:
            return request.referrer
        else:
            return session.pop('referer', None)
    else:
        return None


def set_referer(request):
    """Set manually the referer URI.

    We only allow stashing a URI in here if it is whitelisted against
    the HOST_WHITELIST.
    """
    if request.referrer:
        host = urlparse.urlparse(request.referrer).hostname
        if host in HOST_WHITELIST:
            session['referer'] = request.referrer


def normalize_api_params(params):
    """Normalize GitHub Issues API params to Search API.

    conventions:

    Issues API params        | Search API converted values
    -------------------------|---------------------------------------
    state                    | into q as "state:open", "state:closed"
    creator                  | into q as "author:username"
    mentioned                | into q as "mentions:username"
    direction                | order
    """
    if 'direction' in params:
        params['order'] = params['direction']
        del params['direction']

    # these params need to be added to the "q" param as substrings
    if 'state' in params:
        state_param = ' state:' + params['state']
        params['q'] += state_param
        del params['state']
    if 'creator' in params:
        creator_param = ' author:' + params['creator']
        params['q'] += creator_param
        del params['creator']
    if 'mentioned' in params:
        mentioned_param = ' mentions:' + params['mentioned']
        params['q'] += mentioned_param
        del params['mentioned']
    return params


def rewrite_links(link_header):
    """Rewrite Link header Github API endpoints to our own.

    <https://api.github.com/repositories/17839063/iss...&page=2>; rel="next",
    <https://api.github.com/repositories/17839063/iss...&page=4>; rel="last"

    is transformed into

    </api/issues?per_page=50&page=2>; rel="next",
    </api/issues?per_page=50&page=4>; rel="last" etc.
    """
    header_link_data = parse_link_header(link_header)
    for data in header_link_data:
        uri = data['link']
        uri_tuple = urlparse.urlsplit(uri)
        path = uri_tuple.path
        query = uri_tuple.query
        if path.startswith('/repositories/'):
            # remove repositories and takes the second element
            # of ['17839063', 'issues/398/comments']
            path = path.lstrip('/repositories/').split('/', 1)[1]
        elif path.startswith('/search/issues'):
            path = 'issues/search'
        api_path = '{}{}'.format('/api/', path)
        data['link'] = urlparse.urlunsplit(('', '', api_path, query, ''))
    return format_link_header(header_link_data)


def sanitize_link(link_header):
    """Remove any oauth tokens from the Link header from GitHub.

    see Also rewrite_links.
    """
    header_link_data = parse_link_header(link_header)
    for data in header_link_data:
        data['link'] = remove_oauth(data['link'])
    return format_link_header(header_link_data)


def remove_oauth(uri):
    """Remove Oauth token from a uri.

    Github returns Oauth tokens in some circumstances. We remove it for
    avoiding to spill it in public as it's not necessary in Link Header.
    """
    uri_group = urlparse.urlparse(uri)
    parameters = uri_group.query.split('&')
    clean_parameters_list = [parameter for parameter in parameters
                             if not parameter.startswith('access_token=')]
    clean_parameters = '&'.join(clean_parameters_list)
    clean_uri = uri_group._replace(query=clean_parameters)
    return urlparse.urlunparse(clean_uri)


def rewrite_and_sanitize_link(link_header):
    """Sanitize and then rewrite a link header."""
    return rewrite_links(sanitize_link(link_header))


def parse_link_header(link_header):
    """Return a structured list of objects for an HTTP Link header.

    This is adjusted for github links it will break in a more generic case.
    Do not use this code for your own HTTP Link header parsing.
    Use something like https://pypi.python.org/pypi/LinkHeader/ instead.
    """
    links_list = link_header.split(',')
    header_link_data = []
    for link in links_list:
        # Assuming that link is `<uri>; rel="blah"`. Github only.
        uri_info, rel_info = link.split(';')
        uri_info = uri_info.strip()
        rel_info = rel_info.strip()
        rel_keyword, value = rel_info.split('=')
        # rel values have the form `rel="foo"`, we want `foo`.
        rel_value = value[1:-1]
        # uri have the form `<http://…>`, we want `http://…`.
        uri = uri_info[1:-1]
        header_link_data.append({'link': uri, 'rel': rel_value})
    return header_link_data


def format_link_header(link_header_data):
    """Return a string ready to be used in a Link: header."""
    links = ['<{0}>; rel="{1}"'.format(data['link'], data['rel'])
             for data in link_header_data]
    return ', '.join(links)


def get_comment_data(request_data):
    """Return a comment ready to send to GitHub.

    We do this by JSON-encoding the body property
    of a request's data object.
    """
    comment_data = json.loads(request_data)
    return json.dumps({"body": comment_data['body']})


def get_fixture_headers(file_data):
    """Return headers to be served with a fixture file."""
    headers = {'content-type': JSON_MIME}
    data = json.loads(file_data)
    for item in data:
        if '_fixtureLinkHeader' in item:
            headers.update({'link': item['_fixtureLinkHeader']})
            break
    return headers


def mockable_response(func):
    """Mock out API reponses with a decorator.

    This allows us to send back fixture files when in TESTING mode, rather
    than making API requests over the network. See /api/endpoints.py
    for usage.

    There are fixtures with a md5 checksum, only for requests with arguments.
    """
    @wraps(func)
    def wrapped_func(*args, **kwargs):
        if app.config['TESTING']:
            get_args = request.args.copy()
            full_path = request.full_path
            if get_args:
                # Only requests with arguments, get a fixture with a checksum.
                # We grab the full path of the request URI to compute an md5
                # that will give us the right fixture file.
                checksum = hashlib.md5(full_path).hexdigest()
                file_path = FIXTURES_PATH + request.path + "." + checksum
            else:
                file_path = FIXTURES_PATH + request.path
            full_file_path = file_path + '.json'
            if not os.path.exists(full_file_path):
                print('Fixture expected at: {fix}'.format(fix=full_file_path))
                print('by the http request: {req}'.format(req=request.url))
                return ('', 404)
            else:
                with open(full_file_path, 'r') as f:
                    data = f.read()
                    return (data, 200, get_fixture_headers(data))
        return func(*args, **kwargs)
    return wrapped_func


def extract_url(issue_body):
    """Extract the URL for an issue from WebCompat.

    URL in webcompat.com bugs follow this pattern:
    **URL**: https://example.com/foobar
    """
    url_pattern = re.compile(r'\*\*URL\*\*\: (.+)')
    url_match = re.search(url_pattern, issue_body)
    if url_match:
        url = url_match.group(1).strip()
        if not url.startswith(('http://', 'https://')):
            url = "http://%s" % url
    else:
        url = ""
    return url


def proxy_request(method, path, params=None, headers=None, data=None):
    """Make a GitHub API request with a bot's OAuth token.

    Necessary for non-logged in users.
    * `path` will be appended to the end of the API_URI.
    * Optionally pass in POST data via the `data` arg.
    * Optionally point to a different URI via the `uri` arg.
    * Optionally pass in HTTP headers to forward.
    """
    # Merge passed in headers with AUTH_HEADERS, and add the etag of the
    # request, if it exists, to be sent back to GitHub.
    auth_headers = AUTH_HEADERS.copy()
    if headers:
        auth_headers.update(headers)
    # Grab the correct Requests request method
    req = getattr(requests, method)
    # It's expected that path *won't* start with a leading /
    # https://api.github.com/repos/{0}
    resource_uri = API_URI + path
    return req(resource_uri, data=data, params=params, headers=auth_headers)


def api_request(method, path, params=None, data=None, mime_type=JSON_MIME):
    """Handle communication with the  GitHub API.

    This method handles both logged-in and proxied requests.

    This returns a tuple for the convenience of being able to do:
    `return api_request('get', path, params=params)` directly from a view
    function. Flask will turn a tuple of the format
    (content, status_code, response_headers) into a Response object.
    """
    request_headers = get_request_headers(g.request_headers, mime_type)
    if g.user:
        request_method = github.raw_request
    else:
        request_method = proxy_request
    resource = request_method(method, path, headers=request_headers,
                              params=params, data=data)
    if resource.status_code != 404:
        return (resource.content, resource.status_code,
                get_response_headers(resource))
    else:
        abort(404)


def add_sec_headers(response):
    """Add security-related headers to the response.

    This should be used in @app.after_request to ensure the headers are
    added to all responses.
    """
    if not app.config['LOCALHOST']:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains;'  # noqa
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['X-Frame-Options'] = 'DENY'
    if app.config['LOCALHOST']:
        response.headers['Access-Control-Allow-Origin'] = '*'


def get_img_src_policy():
    """Return the img-src policy directive, depending on environment.

    We allow webcompat.com-hosted images on localhost servers for convenience.
    """
    policy = "img-src 'self' https://www.google-analytics.com https://*.githubusercontent.com data:; "  # noqa
    if app.config['LOCALHOST']:
        policy = "img-src 'self' https://webcompat.com https://www.google-analytics.com https://*.githubusercontent.com data:; "  # noqa
    return policy


def add_csp(response):
    """Add a Content-Security-Policy header to response.

    This should be used in @app.after_request to ensure the header is
    added to all responses.
    """
    csp_params = [
        "default-src 'self'; ",
        "object-src 'none'; ",
        "connect-src 'self' https://api.github.com; ",
        "font-src 'self' https://fonts.gstatic.com; ",
        get_img_src_policy(),
        "manifest-src 'self'; ",
        "script-src 'self' https://www.google-analytics.com https://api.github.com 'nonce-{nonce}'; ".format(nonce=request.nonce),  # noqa
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ",
        "base-uri 'self'; ",
        "frame-ancestors 'self'; ",
        "report-uri /csp-report"
    ]
    response.headers['Content-Security-Policy'] = (''.join(csp_params))


def cache_policy(private=True, uri_max_age=86400, must_revalidate=False):
    """Implement a HTTP Cache Decorator.

    Adds Cache-Control headers.
      * set max-age value (default: 1 day aka 86400s)
      * private by default
      * revalidation (False by default)
    Adds Etag based on HTTP Body.
    Sends a 304 Not Modified in case of If-None-Match.
    """
    def set_policy(view):
        @wraps(view)
        def policy(*args, **kwargs):
            response = make_response(view(*args, **kwargs))
            # we choose if the resource is private or public for caching
            if private:
                response.cache_control.private = True
            else:
                response.cache_control.public = True
            # Instructs the client if it needs to revalidate
            if must_revalidate:
                response.cache_control.must_revalidate = True
            # Instructs how long the Cache should keep the resource
            response.cache_control.max_age = uri_max_age
            # Etag is based on the HTTP body
            response.add_etag(response.data)
            # to send a 304 Not Modified instead of a full HTTP response
            response.make_conditional(request)
            return response
        return update_wrapper(policy, view)
    return set_policy


def get_milestone_list(milestone_name, params=None):
    """Return a dictionary of issues in the milestone."""
    raw_response = api.endpoints.get_issue_category(
        milestone_name, other_params=params)
    milestone_list = json.loads(raw_response[0])
    return milestone_list


def is_valid_issue_form(form):
    """Check if the issue form follows some requirements.

    To be legit the form needs a couple of parameters
    if one essential is missing, it's a bad request.
    We may add more constraints in the future.
    """
    must_parameters = [
        'browser',
        'description',
        'os',
        'problem_category',
        'submit_type',
        'url',
        'username', ]
    form_submit_values = ['github-auth-report', 'github-proxy-report']
    parameters_check = set(must_parameters).issubset(form.keys())
    if parameters_check:
        values_check = form['submit_type'] in form_submit_values
    return parameters_check and values_check


def is_blacklisted_domain(domain):
    """Check if the domain is part of an exclusion list."""
    # see https://github.com/webcompat/webcompat.com/issues/1141
    # see https://github.com/webcompat/webcompat.com/issues/1237
    # see https://github.com/webcompat/webcompat.com/issues/1627
    spamlist = ['www.qiangpiaoruanjian.cn',
                'mailmanager.cityweb.de',
                'coco.fr']
    return domain in spamlist


def form_type(form_request):
    """Check the type of form request for /issues/new.

    It can return either:
    * 'prefill'
    * 'create'
    """
    method = form_request.method
    content_type = form_request.content_type
    if method == 'GET':
        return 'prefill'
    elif method == 'POST' and content_type == 'application/json':
        return 'prefill'
    elif method == 'POST' and content_type.startswith('multipart/form-data'):
        return 'create'
    else:
        return None


def prepare_form(form_request):
    """Extract all known information from the form request.

    This is called by /issues/new to prepare needed by the form
    before being posted on GitHub.
    For HTTP POST:
    The JSON content will override any existing URL parameters.
    The URL parameters will be kept if non-existent in the JSON.
    """
    form_data = {}
    form_data['user_agent'] = request.headers.get('User-Agent')
    form_data['src'] = request.args.get('src')
    form_data['extra_labels'] = request.args.getlist('label')
    form_data['url'] = request.args.get('url')
    # we rely here on the fact we receive the right POST
    # because we tested it with form_type(request)
    if form_request.method == 'POST':
        json_data = form_request.get_json()
        form_data.update(json_data)
    return form_data


def is_json_object(json_data):
    """Check if the JSON data are an object."""
    return isinstance(json_data, dict)


def ab_view(variation_param, variation_value, view):
    """Decorator that allows switching between views based on the AB
    variation parameter.
    """
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            variation = request.args.get(variation_param, None)
            if variation == variation_value:
                return view(*args, **kwargs)
            return func(*args, **kwargs)
        return decorated_function
    return decorator


def ab_redirect(variation_param, variation_value, redirect_url):
    """Decorator that redirects view based on the AB variation parameter."""
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            variation = request.args.get(variation_param, None)
            if variation == variation_value:
                return redirect(redirect_url)
            return func(*args, **kwargs)
        return decorated_function
    return decorator


def ab_active(experiment_id):
    """Checks cookies and returns experiment variation if variation is still
    active or False.
    """
    if experiment_id in request.cookies.keys():
        variation_key = urllib.unquote(request.cookies[experiment_id])
        return variation_key
    return False
