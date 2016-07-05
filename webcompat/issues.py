#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Module that handles submission of issues via the GitHub API, both for an
authed user and the proxy case.'''

import json

from webcompat import github
from webcompat.form import build_formdata
from webcompat.helpers import proxy_request
from webcompat.helpers import REPO_URI


def report_issue(form, proxy=False):
    '''Report an issue, as a logged in user or anonymously.'''
    # /repos/:owner/:repo/issues
    path = 'repos/{0}'.format(REPO_URI)
    if proxy:
        return proxy_request('post', path,
                             data=json.dumps(build_formdata(form)))
    else:
        return github.post(path, build_formdata(form))


def filter_new(issues):
    '''Return the list of "needs triage" issues, encoded as JSON.
    This function gives all the "needs triage" issues.
    '''
    def is_new(issue):
        '''Filter function.'''
        match = True
        category_list = ['status-contactready', 'status-needscontact',
                         'status-needsdiagnosis', 'status-sitewait']
        labels = [label.get('name') for label in issue.get('labels')]
        # if the intersection of labels and category_list is not empty
        # then it's not part of untriaged
        common_cat = set(labels).intersection(category_list)
        if common_cat:
            match = False
        return match

    return json.dumps([issue for issue in issues if is_new(issue)])
