#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import hashlib
import hmac
import json
import re
import requests

from sqlalchemy import update
from webcompat import app
from webcompat.db import issue_db
from webcompat.db import WCIssue
from webcompat.helpers import extract_url
from webcompat.form import normalize_url
from webcompat.form import domain_name


def api_post(endpoint, payload, issue):
    '''Helper method to post junk to GitHub.'''
    headers = {
        'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN'])
    }
    uri = 'https://api.github.com/repos/{0}/{1}/{2}'.format(
        app.config['ISSUES_REPO_URI'], issue, endpoint)
    requests.post(uri, data=json.dumps(payload), headers=headers)


def parse_and_set_label(body, issue_number):
    '''Parse the labels from the body in comment:

    <!-- @browser: value -->. Currently this only handles a single label,
    because that's all that we set in webcompat.com.
    '''
    match_list = re.search(r'<!--\s@(\w+):\s([^\d]+?)\s[\d\.]+\s-->', body)
    if match_list:
        # perhaps we do something more interesting depending on
        # what groups(n)[0] is in the future.
        # right now, match_list.groups(0) should look like:
        # ('browser', 'firefox')
        browser = match_list.groups(0)[1].lower()
        dash_browser = '-'.join(browser.split())
        set_label('browser-' + dash_browser, issue_number)


def set_label(label, issue_number):
    '''Do a GitHub POST request to set a label for the issue.'''
    # POST /repos/:owner/:repo/issues/:number/labels
    # ['Label1', 'Label2']
    payload = [label]
    api_post('labels', payload, issue_number)


def dump_to_db(issue_number, title,
               body, state, status,
               reported_from, creation_time,
               last_change_time):
    url = extract_url(body)
    normalized_url = normalize_url(url)
    domain = domain_name(normalized_url)
    issue_db.add(WCIssue(issue_number, title, url, domain, body, state, status,
                         reported_from, creation_time, last_change_time))
    issue_db.commit()


def update_issue_in_db(issue_number, **kwargs):
    for key, value in kwargs:
        if value:
            update(issue_db).where(issue_db.issue_id == issue_number).\
                values(key=value)


def compare_digest(x, y):
    '''Approximates hmac.compare_digest (Py 2.7.7+) until we
    upgrade.'''
    if not (isinstance(x, bytes) and isinstance(y, bytes)):
        raise TypeError("both inputs should be instances of bytes")
    if len(x) != len(y):
        return False
    result = 0
    for a, b in zip(bytearray(x), bytearray(y)):
        result |= a ^ b
    return result == 0


def signature_check(key, post_signature, payload):
    '''Checks the HTTP POST legitimacy.'''
    sha_name, signature = post_signature.split('=')
    if sha_name != 'sha1':
        return False
    if not signature:
        return False
    # HMAC requires its key to be bytes, but data is strings.
    mac = hmac.new(key, msg=payload, digestmod=hashlib.sha1)
    return compare_digest(mac.hexdigest(), signature.encode('utf-8'))
