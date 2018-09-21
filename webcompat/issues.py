#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Module that handles submission of issues via the GitHub API.

It handles authenticated users and webcompat-bot (proxy) case.
"""

import json

from flask import abort

from webcompat import github
from webcompat.form import build_formdata
from webcompat.helpers import proxy_request
from webcompat.helpers import REPO_URI


def report_issue(form, proxy=False):
    """Report an issue, as a logged in user or anonymously."""
    # /repos/:owner/:repo/issues
    path = 'repos/{0}'.format(REPO_URI)
    submit_type = form.get('submit_type')
    if proxy and submit_type == 'github-proxy-report':
        # Return a Response object.
        response = proxy_request('post',
                                 path,
                                 data=json.dumps(build_formdata(form)))
        json_response = response.json()
    elif (not proxy) and submit_type == 'github-auth-report':
        # Return JSON data as a dict
        json_response = github.post(path, build_formdata(form))
    else:
        abort(400)
    return json_response
