#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for our "API" module, which is used to proxy API calls
back to GitHub'''

import json
from flask import abort, Blueprint, g, request, session, make_response
from flask.ext.github import GitHubError
from webcompat import github, app, cache
from ..issues import REPO_URI, proxy_request, filter_untriaged
from ..helpers import get_user_info

api = Blueprint('api', __name__, url_prefix='/api')
JSON_MIME = 'application/json'


@api.route('/issues')
@cache.cached(timeout=300)
def proxy_issues():
    '''API endpoint to list all issues from GitHub. Cached for 5 minutes.'''
    if g.user:
        issues = github.get('repos/{0}'.format(REPO_URI))
    else:
        issues = proxy_request('get')
    return json.dumps(issues)


@api.route('/issues/<int:number>')
def proxy_issue(number):
    '''XHR endpoint to get issue data from GitHub, either as an authed
    user, or as one of our proxy bots.'''
    if g.user:
        issue = github.raw_request('GET', 'repos/{0}/{1}'.format(
            app.config['ISSUES_REPO_URI'], number))
    else:
        issue = proxy_request('get', '/{0}'.format(number))
    response = make_response(json.dumps(issue.json()))
    response.headers['etag'] = issue.headers.get('etag')
    response.headers['cache-control'] = issue.headers.get('cache-control')
    response.headers['last-modified'] = issue.headers.get('last-modified')
    response.headers['content-type'] = JSON_MIME
    return response


@api.route('/issues/<int:number>/edit', methods=['PATCH'])
def edit_issue(number):
    '''XHR endpoint to push back edits to GitHub for a single issue.
    Note: this is always proxied to allow any logged in user to be able to
    edit issues.'''
    edit = proxy_request('patch', '/{0}'.format(number), data=request.data,
                         token='closerbot')
    return (json.dumps(edit.json()), edit.status_code,
            {'content-type': JSON_MIME})


@api.route('/issues/mine')
@cache.cached(timeout=300)
def user_issues():
    '''API endpoint to return issues filed by the logged in user. Cached
    for five minutes.'''
    get_user_info()
    issues = github.get('repos/{0}?creator={1}&state=all'.format(
        REPO_URI, session['username']))
    return json.dumps(issues)


@api.route('/issues/untriaged')
@cache.cached(timeout=300)
def get_untriaged():
    '''Return all issues that are "untriaged". Essentially all unclosed issues
    with no activity. Cached for five minutes.'''
    if g.user:
        issues = github.raw_request('GET', 'repos/{0}'.format(REPO_URI))
    else:
        issues = proxy_request('get')
    response = make_response(json.dumps(filter_untriaged(issues.json())))
    response.headers['etag'] = issues.headers.get('etag')
    response.headers['cache-control'] = issues.headers.get('cache-control')
    response.headers['content-type'] = JSON_MIME
    return response


@api.route('/issues/contactready')
@cache.cached(timeout=300)
def get_contactready():
    '''Return all issues with a "contactready" label. Cached for five
    minutes.'''
    if g.user:
        uri = 'repos/{0}?labels=contactready'.format(REPO_URI)
        issues = github.raw_request('GET', uri)
    else:
        issues = proxy_request('get', '?labels=contactready')
    response = make_response(json.dumps(issues.json()))
    response.headers['etag'] = issues.headers.get('etag')
    response.headers['cache-control'] = issues.headers.get('cache-control')
    response.headers['content-type'] = JSON_MIME
    return response


@api.route('/issues/needsdiagnosis')
@cache.cached(timeout=300)
def get_needsdiagnosis():
    '''Return all issues with a "needsdiagnosis" label. Cached for five
    minutes.'''
    if g.user:
        uri = 'repos/{0}?labels=needsdiagnosis'.format(REPO_URI)
        issues = github.raw_request('GET', uri)
    else:
        issues = proxy_request('get', '?labels=needsdiagnosis')
    response = make_response(json.dumps(issues.json()))
    response.headers['etag'] = issues.headers.get('etag')
    response.headers['cache-control'] = issues.headers.get('cache-control')
    response.headers['content-type'] = JSON_MIME
    return response


@api.route('/issues/sitewait')
@cache.cached(timeout=300)
def get_sitewait():
    '''Return all issues with a "sitewait" label. Cached for five
    minutes.'''
    if g.user:
        uri = 'repos/{0}?labels=sitewait'.format(REPO_URI)
        issues = github.raw_request('GET', uri)
    else:
        issues = proxy_request('get', '?labels=sitewait')
    response = make_response(json.dumps(issues.json()))
    response.headers['etag'] = issues.headers.get('etag')
    response.headers['cache-control'] = issues.headers.get('cache-control')
    response.headers['content-type'] = JSON_MIME
    return response


@api.route('/issues/<int:number>/comments', methods=['GET', 'POST'])
def proxy_comments(number):
    '''XHR endpoint to get issues comments from GitHub, either as an authed
    user, or as one of our proxy bots.'''
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
        response = make_response(json.dumps(comments.json()))
        response.headers['etag'] = comments.headers.get('etag')
        response.headers['cache-control'] = comments.headers.get('cache-control')
        response.headers['content-type'] = JSON_MIME
        return response


@api.route('/issues/<int:number>/labels', methods=['POST'])
def modify_labels(number):
    '''XHR endpoint to modify issue labels. Sending in an empty array removes
    them all as well. This method is always proxied because non-repo collabs
    can't normally edit labels for an issue.'''
    try:
        labels = proxy_request('put', '/{0}/labels'.format(number),
                               data=request.data, token='labelbot')
        response = make_response(json.dumps(labels.json()), labels.status_code)
        return response
    except GitHubError as e:
        print('GitHubError: ', e.response.status_code)
        return (':(', e.response.status_code)


@api.route('/issues/labels')
@cache.cached(timeout=600)
def get_repo_labels():
    '''XHR endpoint to get all possible labels in a repo. Cached for ten
    minutes.'''
    # Chop off /issues. Someone feel free to refactor the ISSUES_REPO_URI.
    labels_uri = app.config['ISSUES_REPO_URI'][:-7]
    if g.user:
        labels = github.raw_request('GET', 'repos/{0}/labels'.format(labels_uri))
        response = make_response(json.dumps(labels.json()))
        response.headers['etag'] = labels.headers.get('etag')
        response.headers['cache-control'] = labels.headers.get('cache-control')
        response.headers['content-type'] = JSON_MIME
        return response
    else:
        # only authed users should be hitting this endpoint
        abort(401)
