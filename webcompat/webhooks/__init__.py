#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for our "webhooks" module, which we use to do cool things
with GitHub events and actions.

See https://developer.github.com/webhooks/ for what is possible.'''

import json

from flask import Blueprint
from flask import abort
from flask import request

from helpers import parse_and_set_label

webhooks = Blueprint('webhooks', __name__, url_prefix='/webhooks')


@webhooks.route('/labeler', methods=['GET', 'POST'])
def hooklistener():
    '''Listen for the "issues" webhook event, parse the body,
       post back labels. But only do that for the 'opened' action.'''
    if request.method == 'GET':
        abort(403)
    elif (request.method == 'POST' and
            request.headers.get('X-GitHub-Event') == 'issues'):
        payload = json.loads(request.data)
        if payload.get('action') == 'opened':
            issue_body = payload.get('issue')['body']
            issue_number = payload.get('issue')['number']
            parse_and_set_label(issue_body, issue_number)
            return ('gracias, amigo.', 200)
        else:
            return ('cool story, bro.', 200)
    elif (request.method == 'POST' and
            request.headers.get('X-GitHub-Event') == 'ping'):
        return ('pong', 200)
    else:
        abort(403)
