#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import datetime
import json
import hashlib
import math
import os
import urlparse

from babel.dates import format_timedelta
from flask import session
from ua_parser import user_agent_parser

from webcompat import app
from webcompat import github

HOST_WHITELIST = ('webcompat.com', 'staging.webcompat.com',
                  '127.0.0.1', 'localhost')
JSON_MIME = 'application/json'
STATIC_PATH = os.getcwd() + '/webcompat/static'
cache_dict = {}


@app.template_filter('format_delta')
def format_delta_filter(timestamp):
    '''Jinja2 fiter to format a unix timestamp to a time delta string.'''
    delta = datetime.datetime.now() - datetime.datetime.fromtimestamp(timestamp)
    return format_timedelta(delta, locale='en_US')


@app.template_filter('bust_cache')
def bust_cache(file_path):
    '''Jinja2 filter to add a cache busting param based on md5 checksum.

    Uses a simple cache_dict to we don't have to hash each file for every
    request. This is kept in-memory so it will be blown away when the app
    is restarted (which is when file changes would have been deployed).'''
    def get_checksum(file_path):
        try:
            checksum = cache_dict[file_path]
        except KeyError:
            checksum = md5_checksum(file_path)
            cache_dict[file_path] = checksum
        return checksum

    return file_path + '?' + get_checksum(STATIC_PATH + file_path)


def md5_checksum(file_path):
    '''Return the md5 checksum for a given file path.'''
    with open(file_path, 'rb') as fh:
        m = hashlib.md5()
        while True:
            # only read in 8k of the file at a time
            data = fh.read(8192)
            if not data:
                break
            m.update(data)
        return m.hexdigest()


def format_delta_seconds(timestamp):
    '''Return a timedelta by seconds.

    The timedelta is a negative float, so we round up the absolute value and
    cast it to an integer to be more human friendly.
    '''
    delta = datetime.datetime.now() - datetime.datetime.fromtimestamp(timestamp)
    seconds = delta.total_seconds()
    return abs(int(math.ceil(seconds)))


def get_user_info():
    '''Grab the username and avatar URL from GitHub.'''
    if session.get('username') and session.get('avatar_url'):
        return
    else:
        gh_user = github.get('user')
        session['username'] = gh_user.get('login')
        session['avatar_url'] = gh_user.get('avatar_url')


def get_browser_name(user_agent_string):
    '''Return just the browser name.

    unknown user agents will be reported as "other".
    '''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    name = ua_dict.get('user_agent').get('family').lower()
    if (name == 'firefox mobile' and
            ua_dict.get('os').get('family') == 'Firefox OS'):
        name = 'other'
    return name


def get_browser(user_agent_string):
    '''Return browser name family and version.

    It will pre-populate the bug reporting form.
    '''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    ua = ua_dict.get('user_agent')
    name = ua.get('family')
    version = ua.get('major', u'Unknown')
    # Add on the minor and patch version numbers if they exist
    if version != u'Unknown' and ua.get('minor'):
        version = version + "." + ua.get('minor')
        if ua.get('patch'):
            version = version + "." + ua.get('patch')
    else:
        version = ''
    return '{0} {1}'.format(name, version)


def get_os(user_agent_string):
    '''Return operating system name.

    It pre-populates the bug reporting form.
    '''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    os = ua_dict.get('os')
    version = os.get('major', u'Unknown')
    if version != u'Unknown' and os.get('major'):
        version = version + "." + os.get('minor')
        if os.get('patch'):
            version = version + "." + os.get('patch')
    else:
        version = ''
    return '{0} {1}'.format(os.get('family'), version)


def get_headers(response):
    '''Return a dictionary of headers based on a passed in Response object.

    This allows us to proxy response headers from GitHub to our own responses.
    '''
    headers = {'etag': response.headers.get('etag'),
               'cache-control': response.headers.get('cache-control'),
               'content-type': JSON_MIME}

    if response.headers.get('link'):
        headers['link'] = rewrite_and_sanitize_link(response.headers.get('link'))
    return headers


def get_request_headers(headers):
    '''Return a dictionary of headers based on the client Request.

    This allows us to send back headers to GitHub when we are acting as client.
    '''
    client_headers = {'Accept': JSON_MIME}
    if 'If-None-Match' in headers:
        etag = headers['If-None-Match'].encode('utf-8')
        client_headers['If-None-Match'] = etag
    if 'User-Agent' in headers:
        client_headers['User-Agent'] = headers['User-Agent']
    return client_headers


def get_referer(request):
    '''Return the Referer URI based on the passed in Request object.

    Also validate that it came from our own server. If it didn't, check
    the session for a manually stashed 'referer' key, otherwise return None.
    '''
    if request.referrer:
        host = urlparse.urlparse(request.referrer).hostname
        if host in HOST_WHITELIST:
            return request.referrer
        else:
            return session.pop('referer', None)
    else:
        return None


def set_referer(request):
    '''Helper method to manually set the referer URI.

    We only allow stashing a URI in here if it is whitelisted against
    the HOST_WHITELIST.
    '''
    if request.referrer:
        host = urlparse.urlparse(request.referrer).hostname
        if host in HOST_WHITELIST:
            session['referer'] = request.referrer


def normalize_api_params(params):
    '''Normalize GitHub Issues API params to Search API conventions:

    Issues API params        | Search API converted values
    -------------------------|---------------------------------------
    state                    | into q as "state:open", "state:closed"
    creator                  | into q as "author:username"
    mentioned                | into q as "mentions:username"
    direction                | order
    '''
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
    '''Rewrites Link header Github API endpoints to our own.

    <https://api.github.com/repositories/17839063/issues?per_page=50&page=2>; rel="next",
    <https://api.github.com/repositories/17839063/issues?per_page=50&page=4>; rel="last"

    is transformed into

    </api/issues?per_page=50&page=2>; rel="next",
    </api/issues?per_page=50&page=4>; rel="last" etc.
    '''
    header_link_data = parse_link_header(link_header)
    for data in header_link_data:
        uri = data['link']
        api_path, endpoint_path = uri.rsplit('/', 1)
        if api_path.strip().startswith('https://api.github.com/repositories'):
            data['link'] = endpoint_path.replace('issues?', '/api/issues?')
        if api_path.strip().startswith('https://api.github.com/search'):
            data['link'] = endpoint_path.replace('issues?', '/api/issues/search?')
    return format_link_header(header_link_data)


def sanitize_link(link_header):
    '''Remove any oauth tokens from the Link header from GitHub.

    see Also rewrite_links.'''
    header_link_data = parse_link_header(link_header)
    for data in header_link_data:
        data['link'] = remove_oauth(data['link'])
    return format_link_header(header_link_data)


def remove_oauth(uri):
    '''Remove Oauth token from a uri.

    Github returns Oauth tokens in some circumstances. We remove it for
    avoiding to spill it in public as it's not necessary in Link Header.
    '''
    uri_group = urlparse.urlparse(uri)
    parameters = uri_group.query.split('&')
    clean_parameters_list = [parameter for parameter in parameters
                             if not parameter.startswith('access_token=')]
    clean_parameters = '&'.join(clean_parameters_list)
    clean_uri = uri_group._replace(query=clean_parameters)
    return urlparse.urlunparse(clean_uri)


def rewrite_and_sanitize_link(link_header):
    '''Sanitize and then rewrite a link header.'''
    return rewrite_links(sanitize_link(link_header))


def parse_link_header(link_header):
    '''Return a structured list of objects for an HTTP Link header.

    This is adjusted for github links it will break in a more generic case.
    Do not use this code for your own HTTP Link header parsing.
    Use something like https://pypi.python.org/pypi/LinkHeader/ instead.
    '''
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
    '''Return a string ready to be used in a Link: header.'''
    links = ['<{0}>; rel="{1}"'.format(data['link'], data['rel'])
             for data in link_header_data]
    return ', '.join(links)


def get_comment_data(request_data):
    '''Returns a comment ready to send to GitHub.

    We do this by JSON-encoding the rawBody property
    of a request's data object.'''
    comment_data = json.loads(request_data)
    return json.dumps({"body": comment_data['rawBody']})


def extract_url(issue_body):
    '''Extract the URL for an issue from WebCompat.

    URL in webcompat.com bugs follow this pattern:
    **URL**: https://example.com/foobar
    '''
    url_pattern = re.compile('\*\*URL\*\*\: (.*)\n')
    url_match = re.search(url_pattern, issue_body)
    if url_match:
        url = url_match.group(1).strip()
        if not url.startswith(('http://', 'https://')):
            url = "http://%s" % url
    else:
        url = ""
    return url
