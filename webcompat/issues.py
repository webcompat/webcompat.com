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

REJECTED_TITLE = 'Issue rejected.'
REJECTED_BODY = '''<p>The content of this issue doesn't meet our
<a href="https://webcompat.com/terms#acceptable-use">acceptable use</a>
guidelines. Its original content has been deleted.</p>'''
ONGOING_TITLE = 'In the moderation queue.'
ONGOING_BODY = '''<p>This issue has been put in the moderation queue. A human
will review if the message meets our current
<a href="https://webcompat.com/terms#acceptable-use">
acceptable use</a> guidelines.
It will probably take a couple of days depending on the backlog.
Once it has been reviewed, the content will be either made public
or deleted.</p>'''


def moderation_template(choice='ongoing'):
    """Gets the placeholder data to send for unmoderated issues.

    The moderation is for now two types:
    - ongoing: the issue is in the moderation queue.
    - rejected: the issue has been rejected.

    The default is 'ongoing' even with unknown keywords.
    """
    if choice == 'rejected':
        title = REJECTED_TITLE
        body = REJECTED_BODY
    else:
        title = ONGOING_TITLE
        body = ONGOING_BODY
    return {'title': title, 'body': body}


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
    public_data = moderation_template('ongoing')
    # We add action-needsmoderation label, so reviewers can filter out
    public_data['labels'] = ['action-needsmoderation']
    resp = proxy_request('post', path, data=json.dumps(public_data))
    return resp.status_code, resp.json()


def report_issue(form, proxy=False):
    """Report an issue, as a logged in user or anonymously."""
    # /repos/:owner/:repo/issues
    path = 'repos/{0}'.format(REPO_URI)
    submit_type = form.get('submit_type')
    if proxy and submit_type == 'github-proxy-report':
        status_code, json_response = report_public_issue()
        if status_code == 201:
            report_private_issue(form, json_response.get('html_url'))
        else:
            abort(400)
    elif (not proxy) and submit_type == 'github-auth-report':
        # returns JSON data as a dict
        json_response = github.post(path, build_formdata(form))
    else:
        abort(400)
    return json_response
