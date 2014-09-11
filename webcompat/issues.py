#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Module that handles submission of issues via the GitHub API, both for an
authed user and the proxy case.'''

import json
import requests
# from flask import g, url_for, redirect, request
from webcompat.form import build_formdata
from webcompat import github, app

REPO_URI = app.config['ISSUES_REPO_URI']
DEFAULT_TOKEN = app.config['BOT_OAUTH_TOKEN']
TOKEN_MAP = app.config['TOKEN_MAP']


def proxy_request(method, path_mod='', data=None, uri=None, token=None):
    '''Make a GitHub API request with a bot's OAuth token, for non-logged in
    users. `path`, if included, will be appended to the end of the URI.
    Optionally pass in POST data via the `data` arg.'''
    # Create a User Agent string depending on the bot name
    if not token:
        user_agent = 'Basic'
    else:
        user_agent = token
    # Add the authorization header only if we have one
    authorization_token = TOKEN_MAP.get(token, DEFAULT_TOKEN)
    if authorization_token:
        headers = {'Authorization': 'token {0}'.format(authorization_token),
                   'User-Agent': 'WebCompat/{0}'.format(user_agent), }
    else:
        headers = {'User-Agent': 'WebCompat/{0}'.format(user_agent), }
    # Preparing the requests
    req = getattr(requests, method)
    if uri:
        req_uri = 'https://api.github.com/repos/{0}{1}'.format(uri, path_mod)
    else:
        req_uri = 'https://api.github.com/repos/{0}{1}'.format(REPO_URI,
                                                               path_mod)
    if data:
        return req(req_uri, data=data, headers=headers)
    else:
        return req(req_uri, headers=headers)


def report_issue(form, proxy=False):
    '''Report an issue, as a logged in user or anonymously.'''
    if proxy:
        return proxy_request('post', data=json.dumps(build_formdata(form)))
    else:
        return github.post('repos/{0}'.format(REPO_URI), build_formdata(form))


def get_issue(number):
    '''Return a single issue by issue number.'''
    issue_uri = 'repos/{0}/{1}'.format(REPO_URI, number)
    issue = github.get(issue_uri)
    return issue


def filter_untriaged(issues):
    '''For our purposes, "untriaged" means anything that isn't an issue
    with a "contactready", "sitewait", or "needsdiagnosis" label.'''
    def is_untriaged(issue):
        '''Filter function.'''
        match = True
        if issue.get('labels') == []:
            match = True
        else:
            for label in issue.get('labels'):
                if 'contactready' in label.get('name'):
                    match = False
                elif 'needsdiagnosis' in label.get('name'):
                    match = False
                elif 'sitewait' in label.get('name'):
                    match = False
        return match

    return [issue for issue in issues if is_untriaged(issue)]
