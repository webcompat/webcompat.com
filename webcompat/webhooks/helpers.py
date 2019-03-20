#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Helpers methods for webhooks."""

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
from webcompat.helpers import to_bytes

BROWSERS = ['blackberry', 'brave', 'chrome', 'edge', 'firefox', 'iceweasel', 'ie', 'lynx', 'myie', 'opera', 'puffin', 'qq', 'safari', 'samsung', 'seamonkey', 'uc', 'vivaldi']  # noqa


def extract_metadata(body):
    """Parse all the hidden comments for issue metadata.

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
    dash_browser = 'fixme'
    # Only proceed if browser looks like "FooBrowser 99.0"
    if browser and re.search(r'([^\d]+?)\s[\d\.]+', browser):
        browser = browser.lower()
        # Remove parenthesis from the name
        browser = browser.translate(str.maketrans('', '', '()'))
        # Before returning a label, we need to clean up a bit
        label_data = browser.split(' ')
        name = label_data[0]
        remainder = label_data[1:]
        # Let's focus on the known browsers.
        if name in BROWSERS:
            dash_browser = label_data[0]
            # Let's find a type for the browser.
            remainder = label_data[1:]
            browser_type = None
            if 'mobile' in remainder:
                browser_type = 'mobile'
            if 'tablet' in remainder:
                browser_type = 'tablet'
            if browser_type:
                dash_browser = '{dash_browser}-{browser_type}'.format(
                    dash_browser=dash_browser,
                    browser_type=browser_type)
    return 'browser-{name}'.format(name=dash_browser)


def extract_extra_labels(metadata_dict):
    """Return the 'extra_labels' labels from metadata_dict, as a list."""
    labels = metadata_dict.get('extra_labels', None)
    if labels:
        extra_labels = labels.split(', ')
        extra_labels = [label.lower() for label in extra_labels]
    else:
        extra_labels = labels
    return extra_labels


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


def signature_check(key, post_signature, payload):
    """Check the HTTP POST legitimacy."""
    if post_signature.startswith('sha1='):
        sha_name, signature = post_signature.split('=')
    else:
        return False
    if not signature:
        return False
    # HMAC requires its key to be bytes, but data is strings.
    hexmac = get_payload_signature(key, payload)
    return hmac.compare_digest(to_bytes(hexmac), to_bytes(signature))


def get_payload_signature(key, payload):
    """Compute the payload signature given a key.

    key needs to be a bytes object.
    """
    key = to_bytes(key)
    payload = to_bytes(payload)
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


def get_issue_labels(issue_body):
    """Extract the list of labels from an issue body to be sent to GitHub."""
    metadata_dict = extract_metadata(issue_body)
    browser_label = extract_browser_label(metadata_dict)
    extra_labels = extract_extra_labels(metadata_dict)
    priority_label = extract_priority_label(issue_body)
    labelslist = []
    labelslist.extend([browser_label, priority_label])
    if extra_labels:
        labelslist.extend(extra_labels)
    labelslist = [label for label in labelslist if label is not None]
    return labelslist


def new_opened_issue(payload):
    """Set the core actions on new opened issues.

    When a new issue is opened, we set a couple of things.

    - Browser label
    - Priority label
    - Issue milestone
    - Any "extra" labels, set from GET params

    Then Send a GitHub PATCH to set labels and milestone for the issue.

    PATCH /repos/:owner/:repo/issues/:number
    {
        "milestone": 2,
        "labels": ['Label1', 'Label2']
    }
    """
    issue_body = payload.get('issue')['body']
    issue_number = payload.get('issue')['number']
    labels = get_issue_labels(issue_body)
    milestone = app.config['STATUSES']['needstriage']['id']
    # Preparing the proxy request
    headers = {'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN'])}
    path = 'repos/{0}/{1}'.format(app.config['ISSUES_REPO_URI'], issue_number)
    payload_request = {'labels': labels, 'milestone': milestone}
    proxy_response = proxy_request(
        'patch',
        path,
        headers=headers,
        data=json.dumps(payload_request))
    return proxy_response
