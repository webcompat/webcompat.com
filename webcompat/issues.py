#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Module that handles submission of issues via the GitHub API, both for an
authed user and the proxy case.'''

import json

import requests

from webcompat import app
from webcompat.form import build_formdata
from webcompat import github

REPO_URI = app.config['ISSUES_REPO_URI']
BOT_TOKEN = app.config['BOT_OAUTH_TOKEN']
AUTH_HEADERS = {'Authorization': 'token {0}'.format(BOT_TOKEN),
                'User-Agent': 'webcompat/webcompat-bot'}


def proxy_request(method, path_mod='', data=None, params=None, uri=None,
                  headers=None):
    '''Make a GitHub API request with a bot's OAuth token.

    Necessary for non-logged in users.
    * `path`, if included, will be appended to the end of the URI.
    * Optionally pass in POST data via the `data` arg.
    * Optionally point to a different URI via the `uri` arg.
    * Optionally pass in HTTP headers to forward.
    '''
    # Merge passed in headers with AUTH_HEADERS, and add the etag of the
    # request, if it exists, to be sent back to GitHub.
    auth_headers = AUTH_HEADERS.copy()
    if headers:
        auth_headers.update(headers)
    # Preparing the requests
    req = getattr(requests, method)
    if uri:
        req_uri = uri
    else:
        req_uri = 'https://api.github.com/repos/{0}{1}'.format(REPO_URI,
                                                               path_mod)
    return req(req_uri, data=data, params=params, headers=auth_headers)


def report_issue(form, proxy=False):
    '''Report an issue, as a logged in user or anonymously.'''
    if proxy:
        return proxy_request('post', data=json.dumps(build_formdata(form)))
    else:
        return github.post('repos/{0}'.format(REPO_URI), build_formdata(form))


def filter_new(issues):
    '''Return the list of new issues, encoded as JSON.

    "new" means anything that isn't an issue with a "contactready",
    "sitewait", or "needsdiagnosis" label.
    '''
    def is_new(issue):
        '''Filter function.'''
        match = True
        category_list = ['contactready', 'needscontact',
                         'needsdiagnosis', 'sitewait']
        labels = [label.get('name') for label in issue.get('labels')]
        # if the intersection of labels and category_list is not empty
        # then it's not part of untriaged
        common_cat = set(labels).intersection(category_list)
        if common_cat:
            match = False
        return match

    return json.dumps([issue for issue in issues if is_new(issue)])
