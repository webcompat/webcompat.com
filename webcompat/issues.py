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
from webcompat.form import add_metadata
from webcompat.form import build_formdata
from webcompat.helpers import proxy_request

REPO_URI = app.config['ISSUES_REPO_URI']
PRIVATE_REPO_URI = app.config['PRIVATE_REPO_URI']
PRIVATE_REPO_MILESTONE = app.config['PRIVATE_REPO_MILESTONE']


def moderation_template():
    """Gets the placeholder data to send for unmoderated issues."""

    summary = 'In the moderation queue.'
    body = '''<p>This issue has been put in the moderation queue. A human
will review if the message meets our current
<a href="https://www.mozilla.org/en-US/about/legal/acceptable-use/">
acceptable use</a> guidelines.
It will probably take a couple of days depending on the backlog.
Once it has been reviewed, the content will be either made public
or deleted.</p>'''
    return {'title': summary, 'body': body}


def report_private_issue(form, public_url):
    """Report the issue privately.

    This also allows us to pass in public_url metadata, to be
    embedded in the issue body.

    Returns None (so we don't accidentally leak data).
    """
    path = 'repos/{0}'.format(PRIVATE_REPO_URI)
    milestone = PRIVATE_REPO_MILESTONE
    form = add_metadata(form, {'public_url': public_url})
    formdata = build_formdata(form)
    # add the milestone number to set
    formdata['milestone'] = milestone
    proxy_request('post', path, data=json.dumps(formdata))
    return None


def report_public_issue():
    """Report the issue publicly.

    Returns a requests.Response object.
    """
    path = 'repos/{0}'.format(REPO_URI)
    return proxy_request('post', path, data=json.dumps(moderation_template()))


def report_issue(form, proxy=False):
    """Report an issue, as a logged in user or anonymously."""
    # /repos/:owner/:repo/issues
    path = 'repos/{0}'.format(REPO_URI)
    submit_type = form.get('submit_type')
    if proxy and submit_type == 'github-proxy-report':
        response = report_public_issue()
        if (response.status_code == 201):
            json_response = response.json()
            report_private_issue(form, json_response.get('html_url'))
        else:
            abort(400)
    elif (not proxy) and submit_type == 'github-auth-report':
        # returns JSON data as a dict
        json_response = github.post(path, build_formdata(form))
    else:
        abort(400)
    return json_response
