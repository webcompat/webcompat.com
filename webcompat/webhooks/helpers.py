#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Helpers methods for webhooks."""

import hashlib
import hmac
import json
import logging
import re

from requests.exceptions import HTTPError

from webcompat import app
from webcompat.db import Site
from webcompat.db import site_db
from webcompat.form import domain_name
from webcompat.helpers import extract_url
from webcompat.helpers import proxy_request
from webcompat.helpers import to_bytes
from webcompat.issues import moderation_template

BROWSERS = ['blackberry', 'brave', 'chrome', 'edge', 'firefox', 'iceweasel', 'ie', 'lynx', 'myie', 'opera', 'puffin', 'qq', 'safari', 'samsung', 'seamonkey', 'uc', 'vivaldi']  # noqa
MOZILLA_BROWSERS = ['browser-android-components',
                    'browser-fenix',
                    'browser-firefox',
                    'browser-firefox-mobile',
                    'browser-firefox-reality',
                    'browser-firefox-tablet',
                    'browser-focus-geckoview',
                    'browser-geckoview',
                    ]
PUBLIC_REPO = app.config['ISSUES_REPO_URI']
PRIVATE_REPO = app.config['PRIVATE_REPO_URI']


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
                dash_browser = f'{dash_browser}-{browser_type}'
    return f'browser-{dash_browser}'


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
            return f'priority-{priorities[site.priority - 1]}'
        # No host_name in DB, find less-level domain (>2)
        # If host_name is lv4.lv3.example.com, find lv3.example.com/example.com
        subparts = hostname.split('.')
        domains = ['.'.join(subparts[i:])
                   for i, subpart in enumerate(subparts)
                   if 0 < i < hostname.count('.')]
        for domain in domains:
            for site in site_db.query(Site).filter_by(url=domain):
                return f'priority-{priorities[site.priority - 1]}'
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


def get_issue_labels(issue_body):
    """Extract the list of labels from an issue body to be sent to GitHub."""
    labelslist = []
    metadata_dict = extract_metadata(issue_body)
    extra_labels = extract_extra_labels(metadata_dict)
    browser_label = extract_browser_label(metadata_dict)
    if extra_labels:
        # if extra_labels contains a browser tag, we do not need to extract it
        if any(label.startswith('browser') for label in extra_labels):
            browser_label = None
        labelslist.extend(extra_labels)
    priority_label = extract_priority_label(issue_body)
    labelslist.extend([browser_label, priority_label])
    if any(label for label in labelslist if label in MOZILLA_BROWSERS):
        labelslist.append('engine-gecko')
    labelslist = [label for label in labelslist if label is not None]
    return labelslist


def make_request(method, path, payload_request):
    """Helper method to wrap webcompat.helpers.proxy_request.

    Throws requests.exceptions.HTTPError for a non-2XX or 3XX response.
    """
    headers = {'Authorization': f'token {app.config["OAUTH_TOKEN"]}'}
    r = proxy_request(method, path, headers=headers, data=json.dumps(
        payload_request))
    r.raise_for_status()
    return r


def make_response(body, status_code):
    """Helper method to return text/plain response with body & status_code"""
    return (body, status_code, {'Content-Type': 'text/plain'})


def oops():
    """Lazy way to return an oops reponse."""
    return make_response('oops', 400)


def repo_scope(source_repo):
    """Check the scope nature of the repository.

    The repository can be a
    * known public.
    * known private.
    * or completely unknown.
    """
    scope = 'unknown'
    if source_repo.endswith(PUBLIC_REPO.rsplit('/issues')[0]):
        scope = 'public'
    elif source_repo.endswith(PRIVATE_REPO.rsplit('/issues')[0]):
        scope = 'private'
    return scope


def msg_log(msg, issue_number):
    """Write a log with the reason and the issue number."""
    log = app.logger
    log.setLevel(logging.INFO)
    msg = f'issue {issue_number} {msg}'
    log.info(msg)


def prepare_rejected_issue():
    """Create the payload for the rejected moderated issue.

    When the issue has been moderated as rejected,
    we need to change a couple of things in the public space

    - change Title
    - change body
    - close the issue
    - remove the action-needsmoderation label
    - change the milestone to invalid
    """
    # Extract the relevant information
    invalid_id = app.config['STATUSES']['invalid']['id']
    payload_request = moderation_template('rejected')
    payload_request['labels'] = ['status-notacceptable']
    payload_request['state'] = 'closed'
    payload_request['milestone'] = invalid_id
    return payload_request
