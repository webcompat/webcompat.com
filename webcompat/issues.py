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

from webcompat import app
from webcompat import github
from webcompat.form import build_formdata
from webcompat.helpers import proxy_request

REPO_URI = app.config['ISSUES_REPO_URI']
PRIVATE_REPO_URI = app.config['PRIVATE_REPO_URI']


def unmoderated_issue():
    """Gets the placeholder data to send for unmoderated issues."""
    # TODO: Replace this with something meaningful.
    # See https://github.com/webcompat/webcompat.com/issues/3137
    summary = 'Placeholder in-moderation title.'
    body = 'Placeholder in-moderation body.'
    return {'title': summary, 'body': body}


def report_private_issue(form, public_url):
    """Report the anonymous users issue to our private repo.

    This also allows us to pass in public_url metadata, to be
    embedded in the issue body.
    """
    path = 'repos/{0}'.format(PRIVATE_REPO_URI)
    formdata = build_formdata(form, ('public_url', public_url))
    response = proxy_request('post', path, data=json.dumps(formdata))


def report_issue(form, proxy=False):
    """Report an issue, as a logged in user or anonymously."""
    # /repos/:owner/:repo/issues
    path = 'repos/{0}'.format(REPO_URI)
    submit_type = form.get('submit_type')
    if proxy and submit_type == 'github-proxy-report':
        # Return a Response object.
        path = 'repos/{0}'.format(PRIVATE_REPO_URI)
        response = proxy_request('post',
                                 path,
                                 data=json.dumps(unmoderated_issue()))
        if (response.status_code == 201):
            json_response = response.json()
            report_private_issue(form, json_response.get('html_url'))
        else:
            abort(400)
    elif (not proxy) and submit_type == 'github-auth-report':
        # Return JSON data as a dict
        json_response = github.post(path, build_formdata(form))
    else:
        abort(400)
    return json_response
