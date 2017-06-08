#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import hashlib
import hmac
import json
import re
import urlparse

from webcompat import app
from webcompat.helpers import proxy_request


def new_opened_issue(payload):
    '''When a new issue is opened, we set a couple of things.

    - Browser label
    - status-needstriage
    '''
    labels = ['status-needstriage']
    issue_body = payload.get('issue')['body']
    issue_number = payload.get('issue')['number']
    browser_label = extract_browser_label(issue_body)
    if browser_label:
        labels.append(browser_label)
    return set_labels(labels, issue_number)


def is_github_hook(request):
    '''Check if the HTTP POST headers are valid.'''
    if request.headers.get('X-GitHub-Event') is None:
        return False
    post_signature = request.headers.get('X-Hub-Signature')
    if post_signature:
        key = app.config['HOOK_SECRET_KEY']
        return signature_check(key, post_signature, request.data)
    return False


def extract_browser_label(body):
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
        return 'browser-{name}'.format(name=dash_browser)
    else:
        return None


def extract_media_info(body):
    '''Extract information from the payload body for type-media.'''
    # normalize the body for better parsing with regex
    body = body.replace('\r', '')
    match_error = re.search(
        r'<!-- @reported_with: media-decode-error -->\n\n'
        '\*\*URL\*\*:\s'
        '(?P<url>[^\n]+)'
        '[^T]+Technical Information:\nError Code: '
        '(?P<error>\S+)', body)
    if match_error:
        url = match_error.group('url')
        domain = urlparse.urlsplit(url).netloc
        media_error = match_error.group('error')
        return (media_error, domain)
    else:
        return None


def is_known_media(issue_number, body, issues_list):
    """Asserts if it's already an issue we know."""
    media_error, domain = extract_media_info(body)
    # filter the list by domain names
    for line in filter(lambda x: domain in x, issues_list):
        # the issue is already known
        if line.startswith(str(issue_number) + ' '):
            return True
        known_media_error = line.split(' ')[1]
        # do we already have an issue for this error
        if media_error == known_media_error:
            return True
    return False


def set_labels(payload, issue_number):
    '''Do a GitHub POST request to set a label for the issue.

    POST /repos/:owner/:repo/issues/:number/labels
    ['Label1', 'Label2']
    '''
    headers = {
        'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN'])
    }
    path = 'repos/{0}/{1}/labels'.format(
        app.config['ISSUES_REPO_URI'], issue_number)
    return proxy_request('post', path,
                         headers=headers,
                         data=json.dumps(payload))


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
