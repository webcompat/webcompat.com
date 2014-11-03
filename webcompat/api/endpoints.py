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
from webcompat import cache
from webcompat import github
from webcompat import limiter
from webcompat.helpers import get_headers
from webcompat.helpers import get_request_headers
from webcompat.helpers import get_user_info
from webcompat.issues import filter_untriaged
from webcompat.issues import proxy_request


api = Blueprint('api', __name__, url_prefix='/api')
JSON_MIME = 'application/json'
ISSUES_PATH = app.config['ISSUES_REPO_URI']
REPO_PATH = ISSUES_PATH[:-7]


@api.route('/issues/<int:number>')
def proxy_issue(number):
    '''XHR endpoint to get issue data from GitHub.

    either as an authed user, or as one of our proxy bots.
    '''
    if g.user:
        request_headers = get_request_headers(g.request_headers)
        issue = github.raw_request('GET', 'repos/{0}/{1}'.format(
            ISSUES_PATH, number), headers=request_headers)
    else:
        issue = proxy_request('get', '/{0}'.format(number))
    return (issue.content, issue.status_code, get_headers(issue))


@api.route('/issues/<int:number>/edit', methods=['PATCH'])
def edit_issue(number):
    '''XHR endpoint to push back edits to GitHub for a single issue.

    Note: this is always proxied to allow any logged in user to be able to
    edit issues.
    '''
    edit = proxy_request('patch', '/{0}'.format(number), data=request.data)
    return (edit.content, edit.status_code, {'content-type': JSON_MIME})


@api.route('/issues')
def proxy_issues():
    '''API endpoint to list all issues from GitHub.'''
    if request.args.get('page'):
        params = {'page': request.args.get('page')}
    else:
        params = None

    if g.user:
        issues = github.raw_request('GET', 'repos/{0}'.format(ISSUES_PATH),
                                    params=params)
    else:
        issues = proxy_request('get', params=params)
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/category/mine')
def user_issues():
    '''API endpoint to return issues filed by the logged in user.

    Not cached.
    '''
    get_user_info()
    path = 'repos/{0}?creator={1}&state=all'.format(
        ISSUES_PATH, session['username']
    )
    request_headers = get_request_headers(g.request_headers)
    issues = github.raw_request('GET', path, headers=request_headers)
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/category/<issue_category>')
def get_issue_category(issue_category):
    '''Return all issues for a specific category.

    issue_category can be of x types:
    * untriaged (We take care in case there’s no bug)
    * contactready
    * needsdiagnosis
    * sitewait
    '''
    params = {}
    category_list = ['contactready', 'needsdiagnosis', 'sitewait']
    issues_path = 'repos/{0}'.format(ISSUES_PATH)

    if request.args.get('page'):
        params.update({'page': request.args.get('page')})

    if issue_category in category_list:
        params.update({'labels': issue_category})
        if g.user:
            issues = github.raw_request('GET', issues_path, params=params)
        else:
            issues = proxy_request('get', params=params)
    elif issue_category == 'closed':
        params.update({'state': 'closed'})
        if g.user:
            issues = github.raw_request('GET', issues_path, params=params)
        else:
            issues = proxy_request('get', params=params)
    # Note that 'untriaged' here is primarily used on the hompage.
    # For paginated results on the /issues page, see /issues/search/untriaged.
    elif issue_category == 'untriaged':
        if g.user:
            issues = github.raw_request('GET', issues_path)
        else:
            issues = proxy_request('get')
        # Do not send random JSON to filter_untriaged
        if issues.status_code == 200:
            return (filter_untriaged(json.loads(issues.content)),
                    issues.status_code, get_headers(issues))
        else:
            return ({}, issues.status_code, get_headers(issues))
    else:
        # The path doesn’t exist. 404 Not Found.
        abort(404)
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/search')
def get_search_results(query_string=None):
    '''XHR endpoint to get results from GitHub's Search API.

    We're specifically searching "issues" here, which seems to make the most
    sense. Note that the rate limit is different for Search: 20 requests per
    minute. We may want to restrict search to logged in users in the future.

    This method can take a query_string argument, to be called from other
    endpoints, or the query_string can be passed in via the Request object.

    Not cached by us.
    '''
    search_uri = 'https://api.github.com/search/issues'
    # TODO: handle sort and order parameters.
    params = {}

    if query_string is None:
        query_string = request.args.get('q')
        # restrict results to our repo.
    query_string += " repo:{0}".format(REPO_PATH)
    params.update({'q': query_string})

    if request.args.get('page'):
        params.update({'page': request.args.get('page')})

    if g.user:
        request_headers = get_request_headers(g.request_headers)
        results = github.raw_request('GET', 'search/issues', params=params,
                                     headers=request_headers)
    else:
        results = proxy_request('get', params=params, uri=search_uri)
    # The issues are returned in the items property of the response JSON, so
    # throw everything else away.
    json_response = json.loads(results.content)
    if 'items' in json_response:
        result = json.dumps(json_response['items'])
    else:
        result = results.content
    return (result, results.status_code, get_headers(results))


@api.route('/issues/search/untriaged')
def get_untriaged_from_search():
    '''XHR endpoint to get "untriaged" issues from GitHub's Search API.

    There is some overlap between /issues/category/untriaged as used on the
    home page - but this endpoint returns paginated results paginated.
    TODO: Unify that at some point.
    '''
    query_string = ('state:open -label:contactready '
                    '-label:sitewait -label:needsdiagnosis')
    return get_search_results(query_string)


@api.route('/issues/<int:number>/comments', methods=['GET', 'POST'])
def proxy_comments(number):
    '''XHR endpoint to get issues comments from GitHub.

    Either as an authed user, or as one of our proxy bots.
    '''
    if request.method == 'POST':
        try:
            comment_data = json.loads(request.data)
            body = json.dumps({"body": comment_data['rawBody']})
            path = 'repos/{0}/{1}/comments'.format(ISSUES_PATH, number)
            comment = github.raw_request('POST', path, data=body)
            return (json.dumps(comment.json()), comment.status_code,
                    {'content-type': JSON_MIME})
        except GitHubError as e:
            print('GitHubError: ', e.response.status_code)
            return (':(', e.response.status_code)
    else:
        if g.user:
            request_headers = get_request_headers(g.request_headers)
            comments = github.raw_request(
                'GET',
                'repos/{0}/{1}/comments'.format(
                    ISSUES_PATH, number),
                headers=request_headers
                )
        else:
            comments = proxy_request('get', '/{0}/comments'.format(number))
        return (comments.content, comments.status_code, get_headers(comments))


@api.route('/issues/<int:number>/labels', methods=['POST'])
def modify_labels(number):
    '''XHR endpoint to modify issue labels.

    Sending in an empty array removes them all as well.
    This method is always proxied because non-repo collabs
    can't normally edit labels for an issue.
    '''
    try:
        labels = proxy_request('put', '/{0}/labels'.format(number),
                               data=request.data)
        return (labels.content, labels.status_code, get_headers(labels))
    except GitHubError as e:
        print('GitHubError: ', e.response.status_code)
        return (':(', e.response.status_code)


@api.route('/issues/labels')
@cache.cached(timeout=600)
def get_repo_labels():
    '''XHR endpoint to get all possible labels in a repo.

    Cached for 10 minutes.
    '''
    if g.user:
        request_headers = get_request_headers(g.request_headers)
        path = 'repos/{0}/labels'.format(REPO_PATH)
        labels = github.raw_request('GET', path, headers=request_headers)
        return (labels.content, labels.status_code, get_headers(labels))
    else:
        # only authed users should be hitting this endpoint
        abort(401)


@api.route('/rate_limit')
def get_rate_limit():
    '''Endpoint to display the current GitHub API rate limit.

    Will display for the logged in user, or webcompat-bot if not logged in.
    See https://developer.github.com/v3/rate_limit/.
    '''
    rate_limit_uri = 'https://api.github.com/rate_limit'
    if g.user:
        request_headers = get_request_headers(g.request_headers)
        rl = github.raw_request('GET', 'rate_limit', headers=request_headers)
    else:
        rl = proxy_request('get', uri=rate_limit_uri)
    return rl.content
