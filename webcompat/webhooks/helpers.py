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

from webcompat import app


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


def dump_to_db(title, body, issue_number):


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
    if post_signature.startswith('sha1='):
        sha_name, signature = post_signature.split('=')
    else:
        return False
    if not signature:
        return False
    # HMAC requires its key to be bytes, but data is strings.
    hexmac = get_payload_signature(key, payload)
    return compare_digest(hexmac, signature.encode('utf-8'))


def get_payload_signature(key, payload):
    '''Compute the payload signature given a key.'''
    mac = hmac.new(key, msg=payload, digestmod=hashlib.sha1)
    return mac.hexdigest()
