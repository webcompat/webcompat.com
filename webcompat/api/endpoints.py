#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Flask Blueprint for our "API" module.

This is used to make API calls to GitHub, either via a logged-in users
credentials or as a proxy on behalf of anonymous or unauthenticated users.
"""


import json

from flask import abort
from flask import Blueprint
from flask import g
from flask import request
from flask import session

from webcompat import app
from webcompat.helpers import api_request
from webcompat.helpers import get_comment_data
from webcompat.helpers import get_response_headers
from webcompat.helpers import mockable_response
from webcompat.helpers import normalize_api_params
from webcompat.helpers import proxy_request
from webcompat import limiter

api = Blueprint('api', __name__, url_prefix='/api')
JSON_MIME = 'application/json'
ISSUES_PATH = app.config['ISSUES_REPO_URI']
REPO_PATH = ISSUES_PATH[:-7]


@api.route('/issues/<int:number>')
@mockable_response
def proxy_issue(number):
    """XHR endpoint to get issue data from GitHub.

    either as an authed user, or as one of our proxy bots.
    """
    path = 'repos/{0}/{1}'.format(ISSUES_PATH, number)
    return api_request('get', path)


@api.route('/issues/<int:number>/edit', methods=['PATCH'])
@mockable_response
def edit_issue(number):
    """XHR endpoint to push back edits to GitHub for a single issue.

    - It only allows change of state and change of milestones.
    - It is always proxied to allow any logged in user
      to be able to edit issues.
      Format: {'milestone': 2, 'state': 'open'}
    """
    path = 'repos/{0}/{1}'.format(ISSUES_PATH, number)
    patch_data = json.loads(request.data)
    # Create a list of associated milestones id with their mandatory state.
    STATUSES = app.config['STATUSES']
    valid_statuses = [(STATUSES[status]['id'], STATUSES[status]['state'])
                      for status in STATUSES]
    data_check = (patch_data['milestone'], patch_data['state'])
    # The PATCH data can only be of length: 2
    if data_check in valid_statuses and len(patch_data) == 2:
        edit = proxy_request('patch', path, data=request.data)
        return (edit.content, edit.status_code, {'content-type': JSON_MIME})
    # Default will be 403 for this route
    abort(403)


@api.route('/issues')
@mockable_response
def proxy_issues():
    """List all issues from GitHub on the API endpoint."""
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
    path = 'repos/{0}'.format(ISSUES_PATH)
    return api_request('get', path, params=params)


@api.route('/issues/<username>/<parameter>')
@mockable_response
def get_user_activity_issues(username, parameter):
    """Return issues related to a user at the API endpoint.

    cf. https://developer.github.com/v3/issues/#list-issues-for-a-repository
    This is used for "creator" and "mentioned". A special "needsinfo" parameter
    value is converted into a request for labels of the format:

    `status-needsinfo-username`

    Any logged in user can see details for any other logged in user. We can
    extend this to non-logged in users in the future if we want.
    """
    if not g.user:
        abort(401)
    # copy the params so we can add to the dict.
    params = request.args.copy()
    params['state'] = 'all'
    if parameter == 'needsinfo':
        params['labels'] = 'status-needsinfo-{0}'.format(username)
    else:
        params[parameter] = username
    path = 'repos/{path}'.format(path=ISSUES_PATH)
    return api_request('get', path, params=params)


@api.route('/issues/category/<issue_category>')
@mockable_response
def get_issue_category(issue_category, other_params=None):
    """Return all issues for a specific category."""
    category_list = app.config['OPEN_STATUSES']
    issues_path = 'repos/{0}'.format(ISSUES_PATH)
    params = request.args.copy()
    # Used by the dashboard to adjust the list of issues
    if other_params:
        params.update(other_params)
    if issue_category in category_list:
        STATUSES = app.config['STATUSES']
        params.add('milestone', STATUSES[issue_category]['id'])
        return api_request('get', issues_path, params=params)
    elif issue_category == 'closed':
        params['state'] = 'closed'
        return api_request('get', issues_path, params=params)
    else:
        # The path doesn’t exist. 404 Not Found.
        abort(404)


@api.route('/issues/search')
@mockable_response
@limiter.limit('30/minute',
               key_func=lambda: session.get('username', 'proxy-user'))
def get_search_results(query_string=None, params=None):
    """XHR endpoint to get results from GitHub's Search API.

    We're specifically searching "issues" here, which seems to make the most
    sense. Note that the rate limit is different for Search: 30 requests per
    minute.

    If a user hits the rate limit, the Flask Limiter extension will send a
    429. See @app.error_handler(429) in views.py.

    This method can take a query_string argument, to be called from other
    endpoints, or the query_string can be passed in via the Request object.
    """
    params = params or request.args.copy()
    query_string = query_string or params.get('q')
    # Fail early if no appropriate query_string
    if not query_string:
        abort(404)

    # restrict results to our repo.
    query_string += " repo:{0}".format(REPO_PATH)
    params['q'] = query_string

    # convert issues api to search api params here.
    params = normalize_api_params(params)
    path = 'search/issues'
    return api_request('get', path, params=params)


@api.route('/issues/<int:number>/comments', methods=['GET', 'POST'])
@mockable_response
def proxy_comments(number):
    """XHR endpoint to get issues comments from GitHub.

    Either as an authed user, or as one of our proxy bots.
    """
    params = request.args.copy()
    if request.method == 'POST' and g.user:
        path = 'repos/{0}/{1}/comments'.format(ISSUES_PATH, number)
        return api_request('post', path, params=params,
                           data=get_comment_data(request.data))
    else:
        path = 'repos/{0}/{1}/comments'.format(ISSUES_PATH, number)
        return api_request('get', path, params=params)


@api.route('/issues/<int:number>/labels', methods=['POST'])
def modify_labels(number):
    """XHR endpoint to modify issue labels.

    Sending in an empty array removes them all as well.
    This method is always proxied because non-repo collabs
    can't normally edit labels for an issue.
    """
    if g.user:
        path = 'repos/{0}/{1}/labels'.format(ISSUES_PATH, number)
        labels = proxy_request('put', path, data=request.data)
        return (labels.content, labels.status_code,
                get_response_headers(labels))
    else:
        abort(403)


@api.route('/issues/labels')
@mockable_response
def get_repo_labels():
    """XHR endpoint to get all possible labels in a repo."""
    params = request.args.copy()
    path = 'repos/{0}/labels'.format(REPO_PATH)
    return api_request('get', path, params=params)
