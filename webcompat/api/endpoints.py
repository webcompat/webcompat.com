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
from webcompat.helpers import get_headers
from webcompat.helpers import get_user_info
from webcompat.issues import filter_untriaged
from webcompat.issues import proxy_request
from webcompat.issues import REPO_URI


api = Blueprint('api', __name__, url_prefix='/api')
JSON_MIME = 'application/json'


@api.route('/issues')
@cache.cached(timeout=300)
def proxy_issues():
    '''API endpoint to list all issues from GitHub.

    Cached for 5 minutes.
    '''
    if g.user:
        issues = github.get('repos/{0}'.format(REPO_URI))
    else:
        issues = proxy_request('get')
    return json.dumps(issues)


@api.route('/issues/<int:number>')
def proxy_issue(number):
    '''XHR endpoint to get issue data from GitHub.

    either as an authed user, or as one of our proxy bots.
    '''
    if g.user:
        issue = github.raw_request('GET', 'repos/{0}/{1}'.format(
            app.config['ISSUES_REPO_URI'], number))
    else:
        issue = proxy_request('get', '/{0}'.format(number))
    return (issue.content, issue.status_code, get_headers(issue))


@api.route('/issues/<int:number>/edit', methods=['PATCH'])
def edit_issue(number):
    '''XHR endpoint to push back edits to GitHub for a single issue.

    Note: this is always proxied to allow any logged in user to be able to
    edit issues.
    '''
    edit = proxy_request('patch', '/{0}'.format(number), data=request.data,
                         token='closerbot')
    return (edit.content, edit.status_code, {'content-type': JSON_MIME})


@api.route('/issues/mine')
@cache.cached(timeout=300)
def user_issues():
    '''API endpoint to return issues filed by the logged in user.

    Cached for 5 minutes.
    '''
    get_user_info()
    path = 'repos/{0}?creator={1}&state=all'.format(
        REPO_URI, session['username']
    )
    issues = github.raw_request('GET', path)
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/untriaged')
@cache.cached(timeout=300)
def get_untriaged():
    '''Return all issues that are "untriaged".

    Essentially all unclosed issues with no activity.
    Cached for 5 minutes.
    '''
    if g.user:
        issues = github.raw_request('GET', 'repos/{0}'.format(REPO_URI))
    else:
        issues = proxy_request('get')
    # Do not send random JSON to filter_untriaged
    if issues.status_code == 200:
        return (filter_untriaged(json.loads(issues.content)),
                issues.status_code, get_headers(issues))
    else:
        return ({}, issues.status_code, get_headers(issues))


@api.route('/issues/contactready')
@cache.cached(timeout=300)
def get_contactready():
    '''Return all issues with a "contactready" label.

    Cached for 5 minutes.
    '''
    if g.user:
        path = 'repos/{0}?labels=contactready'.format(REPO_URI)
        issues = github.raw_request('GET', path)
    else:
        issues = proxy_request('get', '?labels=contactready')
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/needsdiagnosis')
@cache.cached(timeout=300)
def get_needsdiagnosis():
    '''Return all issues with a "needsdiagnosis" label.

    Cached for 5 minutes.
    '''
    if g.user:
        path = 'repos/{0}?labels=needsdiagnosis'.format(REPO_URI)
        issues = github.raw_request('GET', path)
    else:
        issues = proxy_request('get', '?labels=needsdiagnosis')
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/sitewait')
@cache.cached(timeout=300)
def get_sitewait():
    '''Return all issues with a "sitewait" label.

    Cached for 5 minutes.
    '''
    if g.user:
        path = 'repos/{0}?labels=sitewait'.format(REPO_URI)
        issues = github.raw_request('GET', path)
    else:
        issues = proxy_request('get', '?labels=sitewait')
    return (issues.content, issues.status_code, get_headers(issues))


@api.route('/issues/<int:number>/comments', methods=['GET', 'POST'])
def proxy_comments(number):
    '''XHR endpoint to get issues comments from GitHub.

    Either as an authed user, or as one of our proxy bots.
    '''
    if request.method == 'POST':
        try:
            comment_data = json.loads(request.data)
            body = json.dumps({"body": comment_data['rawBody']})
            path = 'repos/{0}/{1}/comments'.format(REPO_URI, number)
            comment = github.raw_request('POST', path, data=body)
            return (json.dumps(comment.json()), comment.status_code,
                    {'content-type': JSON_MIME})
        except GitHubError as e:
            print('GitHubError: ', e.response.status_code)
            return (':(', e.response.status_code)
    else:
        if g.user:
            comments = github.raw_request(
                'GET',
                'repos/{0}/{1}/comments'.format(
                    app.config['ISSUES_REPO_URI'], number)
                )
        else:
            comments = proxy_request('get', '/{0}/comments'.format(number),
                                     token='commentbot')
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
                               data=request.data, token='labelbot')
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
    # Chop off /issues. Someone feel free to refactor the ISSUES_REPO_URI.
    labels_path = app.config['ISSUES_REPO_URI'][:-7]
    if g.user:
        path = 'repos/{0}/labels'.format(labels_path)
        labels = github.raw_request('GET', path)
        return (labels.content, labels.status_code, get_headers(labels))
    else:
        # only authed users should be hitting this endpoint
        abort(401)
