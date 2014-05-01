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
TOKEN = app.config['BOT_OAUTH_TOKEN']


def report_issue(form):
    return github.post('repos/{0}'.format(URI), build_formdata(form))


def proxy_report_issue(form):
    '''Reports an issue using a bot's auth token, on behalf of a user.'''
    headers = {'Authorization': 'token {0}'.format(TOKEN)}
    uri = 'https://api.github.com/repos/{0}'.format(URI)
    return requests.post(uri, data=json.dumps(build_formdata(form)),
                         headers=headers)
