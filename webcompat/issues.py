#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Module that handles submission of issues via the GitHub API, both for an
authed user and the proxy case.'''

import json
import requests
from webcompat.form import build_formdata
from webcompat import github, app

REPO_URI = app.config['ISSUES_REPO_URI']
TOKEN = app.config['BOT_OAUTH_TOKEN']


def proxy_request(method, path_mod='', data=None, uri=None):
    '''Make a GitHub API request with a bot's OAuth token, for non-logged in
    users. `path`, if included, will be appended to the end of the URI.
    Optionally pass in POST data via the `data` arg.'''
    headers = {'Authorization': 'token {0}'.format(TOKEN)}
    req = getattr(requests, method)
    if uri:
        req_uri = 'https://api.github.com/repos/{0}{1}'.format(uri, path_mod)
    else:
        req_uri = 'https://api.github.com/repos/{0}{1}'.format(REPO_URI,
                                                               path_mod)
    if data:
        return req(req_uri, data=data, headers=headers).json()
    else:
        return req(req_uri, headers=headers).json()


def report_issue(form):
    '''Report an issue, as a logged in user.'''
    return github.post('repos/{0}'.format(REPO_URI), build_formdata(form))


def proxy_report_issue(form):
    '''Report an issue, on behalf of a user.'''
    return proxy_request('post', data=json.dumps(build_formdata(form)))


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


def filter_needs_diagnosis(issues):
    '''For our purposes, "needs diagnosis" means anything that isn't an issue
    with a "contactready" label.'''
    def not_contactready(issue):
        match = True
        if issue.get('labels') == []:
            match = True
        else:
            for label in issue.get('labels'):
                if 'contactready' in label.get('name'):
                    match = False
        return match

    return [issue for issue in issues if not_contactready(issue)]


def get_needs_diagnosis():
    '''Return the first 4 issues that need diagnosis.'''
    issues = github.get('repos/{0}'.format(REPO_URI))
    return filter_needs_diagnosis(issues)[0:4]


def proxy_get_needs_diagnosis():
    '''Return the first 4 issues that need diagnosis.'''
    issues = proxy_request('get')
    return filter_needs_diagnosis(issues)[0:4]


def get_issue(number):
    '''Return a single issue by issue number.'''
    issue_uri = 'repos/{0}/{1}'.format(REPO_URI, number)
    issue = github.get(issue_uri)
    return issue


def add_comment(number, data):
    '''Add a comment to an existing issue.'''
    comment_data = json.loads(data)
    body = {"body": comment_data['rawBody']}
    return github.post('repos/{0}/{1}/comments'.format(REPO_URI, number),
                       body)
