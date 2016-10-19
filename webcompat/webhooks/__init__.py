#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for our "webhooks" module, which we use to do cool things
with GitHub events and actions.

See https://developer.github.com/webhooks/ for what is possible.'''

import json

from flask import abort
from flask import Blueprint
from flask import request

from helpers import dump_to_db
from helpers import parse_and_set_label
from helpers import set_label
from helpers import signature_check
from helpers import update_issue_in_db
from webcompat import app


webhooks = Blueprint('webhooks', __name__, url_prefix='/webhooks')


@webhooks.route('/labeler', methods=['GET', 'POST'])
def hooklistener():
    '''Listen for the "issues" webhook event, parse the body

       Method posts back labels and dumps data to a local db.
       Only in response to the 'opened' action, though.
    '''
    if request.method == 'GET':
        abort(403)
    elif request.method == 'POST':
        event_type = request.headers.get('X-GitHub-Event')
        post_signature = request.headers.get('X-Hub-Signature')
        if post_signature:
            key = app.config['HOOK_SECRET_KEY']
            payload = json.loads(request.data)
            issue_reported_from, issue_title = 'null', None
            issue_body, issue_status = None, None
            if not signature_check(key, post_signature, request.data):
                abort(401)
            if event_type == 'issues':
                if payload.get('action') == 'opened':
                    issue_body = payload.get('issue')['body']
                    issue_title = payload.get('issue')['title']
                    issue_number = payload.get('issue')['number']
                    issue_state = payload.get('issue')['state']
                    for item in payload.get('issue')['labels']:
                        if 'status' in item:
                            issue_status = item.split("status-")[1]
                    issue_creation_time = payload.get('issue')['created_at']
                    issue_last_change_time = payload.get('issue')['updated_at']
                    if 'reported_from' in payload.get('issue'):
                        issue_reported_from = \
                            payload.get('issue')['reported_from']
                    parse_and_set_label(issue_body, issue_number)
                    # Setting "Needs Triage" label by default
                    # to all the new issues raised
                    set_label('status-needstriage', issue_number)
                    dump_to_db(int(issue_number), issue_title, issue_body,
                               issue_state, issue_status, issue_reported_from,
                               issue_creation_time, issue_last_change_time)
                    return ('gracias, amigo.', 200)
                elif payload.get('action') == 'edited':
                    issue_number = payload.get('issue')['number']
                    updated = payload.get('issue')['updated_at']
                    if 'title' in payload.get('changes'):
                        issue_title = payload.get('issue')['title']
                    if 'body' in payload.get('changes'):
                        issue_body = payload.get('issue')['body']
                    update_issue_in_db(int(issue_number),
                                       issue_title=issue_title,
                                       issue_body=issue_body,
                                       issue_last_change_time=updated)
                    return ('gracias, amigo.', 200)
                elif payload.get('action') == 'labeled' or\
                        payload.get('action') == 'unlabeled':
                    issue_number = payload.get('issue')['number']
                    updated = payload.get('issue')['updated_at']
                    for item in payload.get('issue')['labels']:
                        if 'status' in item:
                            issue_status = item.split("status-")[1]
                    update_issue_in_db(int(issue_number),
                                       issue_title=issue_title,
                                       issue_body=issue_body,
                                       issue_status=issue_status,
                                       issue_last_change_time=updated)
                    return ('gracias, amigo.', 200)
                elif payload.get('action') == 'closed':
                    issue_number = payload.get('issue')['number']
                    issue_state = payload.get('issue')['state']
                    updated = payload.get('issue')['updated_at']
                    update_issue_in_db(int(issue_number),
                                       issue_state=issue_state,
                                       issue_last_change_time=updated)
                else:
                    return ('cool story, bro.', 200)
            elif event_type == 'ping':
                return ('pong', 200)
            else:
                abort(403)
        else:
            abort(401)
