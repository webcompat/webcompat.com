#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Module that handles submission of issues via the GitHub API, both for an
authed user and the proxy case.'''

import json

from flask import g
import requests

from webcompat import app
from webcompat.form import build_formdata
from webcompat import github

REPO_URI = app.config['ISSUES_REPO_URI']
JSON_MIME = 'application/json'
headers = {'Authorization': 'token {0}'.format(app.config['BOT_OAUTH_TOKEN']),
           'User-Agent': 'webcompat/webcompat-bot',
           'Accept': JSON_MIME}


def proxy_request(method, path_mod='', data=None, uri=None):
    '''Make a GitHub API request with a bot's OAuth token.

    Necessary for non-logged in users.
    * `path`, if included, will be appended to the end of the URI.
    * Optionally pass in POST data via the `data` arg.
    * Optionally point to a different URI via the `uri` arg.
    '''
    # We capture the etag of the request and sends it back to github
    if 'If-None-Match' in headers:
        etag = g.request_headers['If-None-Match'].encode('utf-8')
        headers['If-None-Match'] = etag
    # Preparing the requests
    req = getattr(requests, method)
    if uri:
        req_uri = '{0}'.format(uri)
    else:
        req_uri = 'https://api.github.com/repos/{0}{1}'.format(REPO_URI,
                                                               path_mod)
    return req(req_uri, data=data, headers=headers)


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
    '''Return the list of untriaged issues, encoded as JSON.

    "untriaged" means anything that isn't an issue with a "contactready",
    "sitewait", or "needsdiagnosis" label.
    '''
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

    return json.dumps([issue for issue in issues if is_untriaged(issue)])
