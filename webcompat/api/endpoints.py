#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for our "API" module, which is used to proxy API calls
back to GitHub'''

import json

from flask import abort
from flask import Blueprint
from flask.ext.github import GitHubError
from flask import g
from flask import request
from flask import session

from webcompat import app
from webcompat import github
from webcompat import limiter
from webcompat.helpers import mockable_response
from webcompat.helpers import get_comment_data
from webcompat.helpers import get_headers
from webcompat.helpers import get_request_headers
from webcompat.helpers import normalize_api_params
from webcompat.helpers import STATIC_PATH
from webcompat.issues import filter_new
from webcompat.issues import proxy_request


api = Blueprint('api', __name__, url_prefix='/api')
JSON_MIME = 'application/json'
ISSUES_PATH = app.config['ISSUES_REPO_URI']
REPO_PATH = ISSUES_PATH[:-7]


@api.route('/issues/<int:number>')
@mockable_response
def proxy_issue(number):
    '''XHR endpoint to get issue data from GitHub.

    either as an authed user, or as one of our proxy bots.
    '''
    request_headers = get_request_headers(g.request_headers)
    if g.user:
        issue = github.raw_request('GET', 'repos/{0}/{1}'.format(
            ISSUES_PATH, number), headers=request_headers)
    else:
        issue = proxy_request('get', '/{0}'.format(number),
                              headers=request_headers)
    if issue.status_code != 404:
        return (issue.content, issue.status_code, get_headers(issue))
    else:
        # We may want in the future handle 500 type of errors.
        # This will return the JSON version of 404
        abort(404)


@api.route('/issues/<int:number>/edit', methods=['PATCH'])
def edit_issue(number):
    '''XHR endpoint to push back edits to GitHub for a single issue.

    Note: this is always proxied to allow any logged in user to be able to
    edit issues.
    '''
    edit = proxy_request('patch', '/{0}'.format(number), data=request.data)
    return (edit.content, edit.status_code, {'content-type': JSON_MIME})


@api.route('/issues')
@mockable_response
def proxy_issues():
    '''API endpoint to list all issues from GitHub.'''
    params = request.args.copy()

    # If there's a q param, then we need to use the Search API
    # and load those results. For logged in users, we handle this at the
    # server level.
    if g.user and params.get('q'):
        return get_search_results(params.get('q'), params)
    # Non-authed users should never get here--the request is made to
    # GitHub client-side)--but return out of paranoia anyways.
    elif params.get('q'):
        abort(404)

    if g.user:
        issues = github.raw_request('GET', 'repos/{0}'.format(ISSUES_PATH),
                                    params=params)
    else:
        issues = proxy_request('get', params=params)
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/category/<issue_category>')
@mockable_response
def get_issue_category(issue_category):
    '''Return all issues for a specific category.

    issue_category can be of x types:
    * new
    * closed
    * contactready
    * needscontact
    * needsdiagnosis
    * sitewait
    '''
    category_list = ['contactready', 'needscontact',
                     'needsdiagnosis', 'sitewait']
    issues_path = 'repos/{0}'.format(ISSUES_PATH)
    params = request.args.copy()

    if issue_category in category_list:
        # add "status-" before the filter param to match the naming scheme
        # of the repo labels.
        params['labels'] = 'status-' + issue_category
        if g.user:
            issues = github.raw_request('GET', issues_path, params=params)
        else:
            issues = proxy_request('get', params=params)
    elif issue_category == 'closed':
        params['state'] = 'closed'
        if g.user:
            issues = github.raw_request('GET', issues_path, params=params)
        else:
            issues = proxy_request('get', params=params)
    # Note that 'new' here is primarily used on the homepage.
    # For paginated results on the /issues page, see /issues/search/new.
    elif issue_category == 'new':
        if g.user:
            issues = github.raw_request('GET', issues_path, params=params)
        else:
            issues = proxy_request('get', params=params)
        # Do not send random JSON to filter_new
        if issues.status_code == 200:
            return (filter_new(json.loads(issues.content)),
                    issues.status_code, get_headers(issues))
        else:
            return ({}, issues.status_code, get_headers(issues))
    else:
        # The path doesn’t exist. 404 Not Found.
        abort(404)
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/search')
@mockable_response
@limiter.limit('30/minute',
               key_func=lambda: session.get('username', 'proxy-user'))
def get_search_results(query_string=None, params=None):
    '''XHR endpoint to get results from GitHub's Search API.

    We're specifically searching "issues" here, which seems to make the most
    sense. Note that the rate limit is different for Search: 30 requests per
    minute.

    If a user hits the rate limit, the Flask Limiter extension will send a
    429. See @app.error_handler(429) in views.py.

    This method can take a query_string argument, to be called from other
    endpoints, or the query_string can be passed in via the Request object.
    '''
    params = params or request.args.copy()
    query_string = query_string or params.get('q')
    # Fail early if no appropriate query_string
    if not query_string:
        abort(404)
    search_uri = 'https://api.github.com/search/issues'

    # restrict results to our repo.
    query_string += " repo:{0}".format(REPO_PATH)
    params['q'] = query_string

    # convert issues api to search api params here.
    params = normalize_api_params(params)
    request_headers = get_request_headers(g.request_headers)

    if g.user:
        results = github.raw_request('GET', 'search/issues', params=params,
                                     headers=request_headers)
    else:
        results = proxy_request('get', params=params, uri=search_uri,
                                headers=request_headers)
    return (results.content, results.status_code, get_headers(results))


@api.route('/issues/search/<issue_category>')
def get_category_from_search(issue_category):
    '''XHR endpoint to get issues categories from GitHub's Search API.

    It's also possible to use /issues/category/<issue_category> for a category
    that maps to a label. This uses the Issues API, which is less costly than
    the Search API.
    '''
    category_list = ['contactready', 'needscontact',
                     'needsdiagnosis', 'sitewait']
    params = request.args.copy()

    if issue_category in category_list:
        # add "status-" before the issue_category to match
        # the naming scheme of the repo labels.
        query_string = 'label:{0}'.format('status-' + issue_category)
        return get_search_results(query_string, params)
    elif issue_category == 'new':
        query_string = ' '.join(
            ['-label:status-%s' % cat for cat in category_list])
        query_string += ' state:open '
        return get_search_results(query_string, params)
    else:
        # no known keyword we send not found
        abort(404)


@api.route('/issues/<int:number>/comments', methods=['GET', 'POST'])
@mockable_response
def proxy_comments(number):
    '''XHR endpoint to get issues comments from GitHub.

    Either as an authed user, or as one of our proxy bots.
    '''
    if request.method == 'POST':
        try:
            path = 'repos/{0}/{1}/comments'.format(ISSUES_PATH, number)
            comment = github.raw_request('POST', path,
                                         data=get_comment_data(request.data))
            return (comment.content, comment.status_code,
                    {'content-type': JSON_MIME})
        except GitHubError as e:
            print('GitHubError: ', e.response.status_code)
            return (':(', e.response.status_code)
    else:
        request_headers = get_request_headers(g.request_headers)

        if g.user:
            comments = github.raw_request(
                'GET', 'repos/{0}/{1}/comments'.format(ISSUES_PATH, number),
                headers=request_headers)
        else:
            comments = proxy_request('get', '/{0}/comments'.format(number),
                                     headers=request_headers)
        return (comments.content, comments.status_code, get_headers(comments))


@api.route('/issues/<int:number>/labels', methods=['POST'])
def modify_labels(number):
    '''XHR endpoint to modify issue labels.

    Sending in an empty array removes them all as well.
    This method is always proxied because non-repo collabs
    can't normally edit labels for an issue.
    '''
    try:
        if g.user:
            labels = proxy_request('put', '/{0}/labels'.format(number),
                                   data=request.data)
            return (labels.content, labels.status_code, get_headers(labels))
        else:
            abort(403)
    except GitHubError as e:
        print('GitHubError: ', e.response.status_code)
        return (':(', e.response.status_code)

@api.route('/issues/labels')
@mockable_response
def get_repo_labels():
    '''XHR endpoint to get all possible labels in a repo.
    '''
    with open( STATIC_PATH + '/config_data/labels.json') as f:
        return (f.read(), 200, {'content-type': JSON_MIME})


@api.route('/rate_limit')
def get_rate_limit():
    '''Endpoint to display the current GitHub API rate limit.

    Will display for the logged in user, or webcompat-bot if not logged in.
    See https://developer.github.com/v3/rate_limit/.
    '''

    rate_limit_uri = 'https://api.github.com/rate_limit'
    request_headers = get_request_headers(g.request_headers)
    if g.user:
        rl = github.raw_request('GET', 'rate_limit', headers=request_headers)
    else:
        rl = proxy_request('get', uri=rate_limit_uri, headers=request_headers)
    return rl.content
