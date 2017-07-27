#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Flask Blueprint for our "webhooks" module.webhooks

See https://developer.github.com/webhooks/ for what is possible."""

import json
import logging

from flask import Blueprint
from flask import request

from helpers import is_github_hook
from helpers import get_issue_info
from helpers import new_opened_issue


from webcompat import app

webhooks = Blueprint('webhooks', __name__, url_prefix='/webhooks')


@webhooks.route('/labeler', methods=['POST'])
def hooklistener():
    """Listen for the "issues" webhook event.

    By default, we return a 403 HTTP response.
    """
    if not is_github_hook(request):
        return ('Nothing to see here', 401, {'Content-Type': 'text/plain'})
    payload = json.loads(request.data)
    event_type = request.headers.get('X-GitHub-Event')
    # Treating events related to issues
    if event_type == 'issues':
        issue = get_issue_info(payload)
        # A new issue has been created.
        # In the future we can add new type of actions.
        if issue['action'] == 'opened':
            # we are setting labels on each new open issues
            response = new_opened_issue(payload)
            if response.status_code == 200:
                return ('gracias, amigo.', 200, {'Content-Type': 'text/plain'})
            else:
                log = app.logger
                log.setLevel(logging.INFO)
                msg = 'failed to set labels on issue {issue}'.format(
                    issue['number'])
                log.info(msg)
                return ('ooops', 400, {'Content-Type': 'text/plain'})
    elif event_type == 'ping':
        return ('pong', 200, {'Content-Type': 'text/plain'})
    # If nothing worked as expected, the default response is 403.
    return ('Not an interesting hook', 403, {'Content-Type': 'text/plain'})
