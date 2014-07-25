#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for our "API" module, which is used to proxy API calls
back to GitHub'''

import json
from flask import abort, Blueprint, g, request
from flask.ext.github import GitHubError
from webcompat import github, app
from ..issues import proxy_request, add_comment

api = Blueprint('api', __name__, url_prefix='/api')

JSON_MIME = 'application/json'


@api.route('/issues/<int:number>')
def proxy_issue(number):
    '''XHR endpoint to get issue data from GitHub, either as an authed
    user, or as one of our proxy bots.'''
    if request.is_xhr and request.headers.get('accept') == 'application/json':
        if g.user:
            issue = github.get('repos/{0}/{1}'.format(
                app.config['ISSUES_REPO_URI'], number))
        else:
            issue = proxy_request('get', '/{0}'.format(number))
        return json.dumps(issue)
    else:
        abort(406)


@api.route('/issues/<int:number>/comments', methods=['GET', 'POST'])
def proxy_comments(number):
    '''XHR endpoint to get issues comments from GitHub, either as an authed
    user, or as one of our proxy bots.'''
    if request.method == 'POST':
        try:
            add_comment(number, request.data)
            return ':)'
        except GitHubError as e:
            print('GitHubError: ', e.response.status_code)
            return (':(', e.response.status_code)
    elif request.is_xhr and request.headers.get('accept') == JSON_MIME:
        if g.user:
            comments = github.get('repos/{0}/{1}/comments'.format(
                app.config['ISSUES_REPO_URI'], number))
        else:
            comments = proxy_request('get', '/{0}/comments'.format(number))
        return json.dumps(comments)
    else:
        abort(406)


@api.route('/issues/<int:number>/labels', methods=['POST'])
def modify_labels(number):
    '''XHR endpoint to modify issue labels. Sending in an empty array removes
    them all as well.'''
    try:
        labels = proxy_request('put', '/{0}/labels'.format(number),
                               data=request.data)
        return json.dumps(labels)
    except GitHubError as e:
        print('GitHubError: ', e.response.status_code)
        return (':(', e.response.status_code)


@api.route('/issues/labels')
def get_repo_labels():
    '''XHR endpoint to get all possible labels in a repo.'''
    # Chop off /issues. Someone feel free to refactor the ISSUES_REPO_URI.
    labels_uri = app.config['ISSUES_REPO_URI'][:-7]
    if request.is_xhr and request.headers.get('accept') == JSON_MIME:
        if g.user:
            labels = github.get('repos/{0}/labels'.format(labels_uri))
        else:
            labels = proxy_request('get', '/labels', uri=labels_uri)
        return json.dumps(labels)
