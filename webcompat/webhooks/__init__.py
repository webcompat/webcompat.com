#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""WebHooks module

See https://developer.github.com/ for what is possible.
"""

import json

from flask import request

from webcompat.webhooks.helpers import is_github_hook
from webcompat.webhooks.helpers import make_response
from webcompat.webhooks.helpers import process_issue_action
from webcompat.webhooks.model import WebHookIssue

from webcompat import app


@app.route('/webhooks/labeler', methods=['POST'])
def hooklistener():
    """Listen for the "issues" webhook event.

    By default, we return a 403 HTTP response.
    """
    # webcompat/webcompat-tests/issues
    if not is_github_hook(request):
        return make_response('Nothing to see here', 401)
    payload = json.loads(request.data)
    event_type = request.headers.get('X-GitHub-Event')
    # Treating events related to issues
    if event_type == 'issues':
        webhook_issue = WebHookIssue.from_dict(payload)
        # we process the action
        return process_issue_action(webhook_issue)
    elif event_type == 'ping':
        return make_response('pong', 200)
    # If nothing worked as expected, the default response is 403.
    return make_response('Not an interesting hook', 403)
