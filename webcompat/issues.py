#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Module that handles submission of issues via the GitHub API, both for an
authed user and the proxy case.'''

import json
import requests
from flask import session
from form import build_formdata
from webcompat import github, app

URI = app.config['ISSUES_REPO_URI']
CONTACT_READY_URI = 'repos/{0}?labels=contactready'.format(URI)
NEEDS_DIAGNOSIS_URI = 'repos/{0}'.format(URI)
TOKEN = app.config['BOT_OAUTH_TOKEN']


def proxy_request(method, uri, data=None):
    '''Make a GitHub API request with a bot's OAuth token, for non-logged in
    users. Optionally pass in POST data via the `data` arg.'''
    headers = {'Authorization': 'token {0}'.format(TOKEN)}
    uri = 'https://api.github.com/repos/{0}'.format(URI)
    req = getattr(requests, method)
    if data:
        return req(uri, data=data, headers=headers)
    else:
        return req(uri, headers=headers)


def report_issue(form):
    '''Report an issue, as a logged in user.'''
    return github.post('repos/{0}'.format(URI), build_formdata(form))


def proxy_report_issue(form):
    '''Report an issue, on behalf of a user.'''
    uri = 'https://api.github.com/repos/{0}'.format(URI)
    return proxy_request('post', uri, data=json.dumps(build_formdata(form)))


def add_status_class(issues):
    '''Add a "status_class" property to each issue to be used by CSS.'''
    for issue in issues:
        # default is needs-diagnosis
        issue['status_class'] = u'issue-needs-diagnosis'
        for label in issue.get('labels'):
            if 'contactready' in label.get('name'):
                issue['status_class'] = u'issue-contactready'
                break
        if issue.get('closed_at'):
            issue['status_class'] = u'issue-closed'
    return issues


def get_user_issues(username):
    '''Return all issues in the repo reported by {{username}} (the creator
    in the JSON response.'''
    user_issues_uri = 'repos/{0}?creator={1}&state=all'.format(URI, username)
    issues = github.get(user_issues_uri)
    return add_status_class(issues)[0:8]


def get_contact_ready():
    '''Return all issues with a "contactready" label.'''
    return github.get(CONTACT_READY_URI)


def proxy_get_contact_ready():
    '''Return a proxied request for all issues with a "contactready" label.'''
    return proxy_request('get', CONTACT_READY_URI)


def filter_needs_diagnosis(issues):
    '''For our purposes, "needs diagnosis" means anything that isn't an issue
    with a "contactready" label.'''
    return [issue for issue in issues if not 'contactready' in issue["labels"]]


def get_needs_diagnosis():
    '''Return the first 4 issues that need diagnosis.'''
    issues = github.get(NEEDS_DIAGNOSIS_URI)
    return filter_needs_diagnosis(issues)[0:4]


def proxy_get_needs_diagnosis():
    '''Return the first 4 issues that need diagnosis.'''
    issues = proxy_request('get', NEEDS_DIAGNOSIS_URI)
    return filter_needs_diagnosis(issues)[0:4]
