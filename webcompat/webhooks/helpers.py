#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import hashlib
import hmac
import json
import re

from webcompat import app
from webcompat.db import Site
from webcompat.db import site_db
from webcompat.form import domain_name
from webcompat.helpers import extract_url
from webcompat.helpers import proxy_request


def extract_metadata(body):
    """Parse all the hidden comments for issue metadata

    <!-- @foo: bar -->.
    Returns a dict with all such comments as members,
    with foo, bar as key, value.
    """
    match_list = re.findall(r'<!--\s@(\w+):\s(.+)\s-->', body)
    # Reverse the list before creating a dict, because we want to keep
    # the first instance (in case there are duplicates added by the user after)
    metadata_dict = dict(reversed(match_list))
    return metadata_dict


def extract_browser_label(metadata_dict):
    """Return the browser label from metadata_dict."""
    browser = metadata_dict.get('browser', None)
    # Only proceed if browser looks like "FooBrowser 99.0"
    if browser and re.search(r'([^\d]+?)\s[\d\.]+', browser):
        browser = browser.lower()
        browser = browser.rsplit(' ', 1)[0]
        browser = browser.encode('utf-8')
        browser = browser.translate(None, '()')
        dash_browser = '-'.join(browser.split())
        return 'browser-{name}'.format(name=dash_browser)
    else:
        return None


def extract_extra_label(metadata_dict):
    """Return the 'extra' label from metadata_dict"""
    extra_label = metadata_dict.get('extra_label', None)
    if extra_label:
        extra_label = extra_label.lower()
        extra_label = extra_label.encode('utf-8')
    return extra_label


def extract_priority_label(body):
    """Parse url from body and query the priority labels."""
    hostname = domain_name(extract_url(body))
    if hostname:
        priorities = ['critical', 'important', 'normal']
        # Find host_name in DB
        for site in site_db.query(Site).filter_by(url=hostname):
            return 'priority-{}'.format(priorities[site.priority - 1])
        # No host_name in DB, find less-level domain (>2)
        # If host_name is lv4.lv3.example.com, find lv3.example.com/example.com
        subparts = hostname.split('.')
        domains = ['.'.join(subparts[i:])
                   for i, subpart in enumerate(subparts)
                   if 0 < i < hostname.count('.')]
        for domain in domains:
            for site in site_db.query(Site).filter_by(url=domain):
                return 'priority-{}'.format(priorities[site.priority - 1])
    return None


def update_issue(payload, issue_number):
    """Does a GitHub PATCH request to set labels and milestone for the issue.

    PATCH /repos/:owner/:repo/issues/:number
    {
        "milestone": 2,
        "labels": ['Label1', 'Label2']
    }
    """
    headers = {
        'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN'])
    }
    path = 'repos/{0}/{1}'.format(app.config['ISSUES_REPO_URI'], issue_number)
    return proxy_request('patch', path,
                         headers=headers,
                         data=json.dumps(payload))


def compare_digest(x, y):
    """Approximates hmac.compare_digest (Py 2.7.7+) until we upgrade."""
    if not (isinstance(x, bytes) and isinstance(y, bytes)):
        raise TypeError("both inputs should be instances of bytes")
    if len(x) != len(y):
        return False
    result = 0
    for a, b in zip(bytearray(x), bytearray(y)):
        result |= a ^ b
    return result == 0


def signature_check(key, post_signature, payload):
    """Checks the HTTP POST legitimacy."""
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
    """Compute the payload signature given a key."""
    mac = hmac.new(key, msg=payload, digestmod=hashlib.sha1)
    return mac.hexdigest()


def is_github_hook(request):
    """Validate the github webhook HTTP POST request."""
    if request.headers.get('X-GitHub-Event') is None:
        return False
    post_signature = request.headers.get('X-Hub-Signature')
    if post_signature:
        key = app.config['HOOK_SECRET_KEY']
        return signature_check(key, post_signature, request.data)
    return False


def get_issue_info(payload):
    """Extract all information we need when handling webhooks for issues."""
    # Extract the title and the body
    title = payload.get('issue')['title']
    # Create the issue dictionary
    return {'action': payload.get('action'),
            'number': payload.get('issue')['number'],
            'domain': title.partition(' ')[0]}


def new_opened_issue(payload):
    '''When a new issue is opened, we set a couple of things.

    - Browser label
    - Priority label
    - Issue milestone
    '''
    issue_body = payload.get('issue')['body']
    issue_number = payload.get('issue')['number']
    metadata_dict = extract_metadata_labels(issue_body)
    browser_label = extract_browser_label(metadata_dict)
    extra_label = extract_extra_label(metadata_dict)
    priority_label = extract_priority_label(issue_body)
    labels = [label for label in (browser_label, extra_label, priority_label)
              if label is not None]
    milestone = app.config['STATUSES']['needstriage']['id']
    return update_issue({'labels': labels, 'milestone': milestone},
                        issue_number)
