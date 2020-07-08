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

from webcompat import app
from webcompat.db import Site
from webcompat.db import site_db
from webcompat.form import domain_name
from webcompat.helpers import extract_url
from webcompat.helpers import proxy_request
from webcompat.helpers import to_bytes
from webcompat.issues import moderation_template

BROWSERS = ['blackberry', 'brave', 'chrome', 'edge', 'firefox', 'iceweasel', 'ie', 'lynx', 'myie', 'opera', 'puffin', 'qq', 'safari', 'samsung', 'seamonkey', 'uc', 'vivaldi']  # noqa
MOZILLA_BROWSERS = ['browser-fenix',
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


def get_issue_info(payload):
    """Extract all information we need when handling webhooks for issues."""
    # Extract the title and the body
    issue = payload.get('issue')
    full_title = issue.get('title', 'Weird_Title - Inspect')
    labels = issue.get('labels', [])
    issue_body = issue.get('body')
    public_url = extract_metadata(issue_body).get('public_url', '')
    # Create the issue dictionary
    issue_info = {
        'action': payload.get('action'),
        'body': issue_body,
        'domain': full_title.partition(' ')[0],
        'number': issue.get('number'),
        'public_url': public_url.strip(),
        'repository_url': issue.get('repository_url'),
        'state': issue.get('state'),
        'title': full_title}
    # If labels on the original issue, we need them.
    original_labels = [label['name'] for label in labels]
    issue_info['original_labels'] = original_labels
    # webhook with a milestone already set
    if issue.get('milestone'):
        issue_info['milestone'] = issue['milestone']['title']
    # webhook with a milestoned action
    if payload.get('milestone'):
        issue_info['milestoned_with'] = payload.get('milestone')['title']
    return issue_info


def get_public_issue_number(public_url):
    """Extract the issue number from the public url."""
    public_number = public_url.strip().rsplit('/', 1)[1]
    return public_number


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
    """Helper method to wrap webcompat.helpers.proxy_request."""
    headers = {'Authorization': f'token {app.config["OAUTH_TOKEN"]}'}
    return proxy_request(method, path, headers=headers, data=json.dumps(
        payload_request))


def tag_new_public_issue(issue_info):
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
    issue_body = issue_info['body']
    issue_number = issue_info['number']
    # Grabs the labels already set so they will not be erased
    # Gets the labels from the body
    labels = get_issue_labels(issue_body)
    labels.extend(issue_info['original_labels'])
    milestone = app.config['STATUSES']['needstriage']['id']
    # Preparing the proxy request
    path = f'repos/{PUBLIC_REPO}/{issue_number}'
    payload_request = {'labels': labels, 'milestone': milestone}
    proxy_response = make_request('patch', path, payload_request)
    return proxy_response


def process_issue_action(issue_info):
    """Route the actions and provide different responses.

    There are two possible known scopes:
    * public repo
    * private repo

    Currently the actions we are handling are (for now):
    * opened (public repo only)
      Aka newly issues created and
      need to be assigned labels and milestones
    * milestoned (private repo only)
      When the issue is being moderated with a milestone: accepted
    """
    source_repo = issue_info['repository_url']
    scope = repo_scope(source_repo)
    issue_number = issue_info['number']
    # We do not process further in case
    # we don't know what we are dealing with
    if scope == 'unknown':
        return ('Wrong repository', 403, {'Content-Type': 'text/plain'})
    if issue_info['action'] == 'opened' and scope == 'public':
        # we are setting labels on each new open issues
        response = tag_new_public_issue(issue_info)
        if response.status_code == 200:
            return ('gracias, amigo.', 200, {'Content-Type': 'text/plain'})
        else:
            msg_log('public:opened labels failed', issue_number)
            return ('ooops', 400, {'Content-Type': 'text/plain'})
    elif issue_info['action'] == 'opened' and scope == 'private':
        # webcompat-bot needs to comment on this issue with the URL
        response = comment_public_uri(issue_info)
        if response.status_code == 200:
            return ('public url added', 200, {'Content-Type': 'text/plain'})
        else:
            msg_log('comment failed', issue_number)
            return ('ooops', 400, {'Content-Type': 'text/plain'})
    elif (issue_info['action'] == 'milestoned' and
          scope == 'private' and
          issue_info['milestoned_with'] == 'accepted'):
        # private issue have been moderated and we will make it public
        response = private_issue_moderation(issue_info)
        if response.status_code == 200:
            # if it succeeded, we can close the private issue
            path = f'repos/{PRIVATE_REPO}/{issue_info["number"]}'
            make_request('patch', path, {'state': 'closed'})
            return ('Moderated issue accepted',
                    200, {'Content-Type': 'text/plain'})
        else:
            msg_log('private:moving to public failed', issue_number)
            return ('ooops', 400, {'Content-Type': 'text/plain'})
    elif (scope == 'private' and
          issue_info['state'] == 'closed' and
          not issue_info['milestone'] == 'accepted'):
        # private issue has been closed. It is rejected
        # We need to patch with a template.
        response = private_issue_rejected(issue_info)
        if response.status_code == 200:
            return ('Moderated issue rejected',
                    200, {'Content-Type': 'text/plain'})
        else:
            msg_log('public rejection failed', issue_number)
            return ('ooops', 400, {'Content-Type': 'text/plain'})
    else:
        return ('Not an interesting hook', 403, {'Content-Type': 'text/plain'})


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


def prepare_accepted_issue(issue_info):
    """Create the payload for the accepted moderated issue.

    When the issue has been moderated as accepted,
    we need to change a couple of things in the public space

    - Title
    - Body
    - Any labels from the private issue
    """
    # Extract the relevant information
    public_url = issue_info['public_url']
    body = issue_info['body']
    title = issue_info['title']
    issue_number = issue_info['number']
    # Gets the labels from the body
    labels = get_issue_labels(body)
    labels.extend(issue_info['original_labels'])
    # Let's remove action-needsmoderation in case it's here
    if 'action-needsmoderation' in labels:
        labels.remove('action-needsmoderation')
    # Prepares the payload
    payload_request = {
        'labels': labels,
        'title': title,
        'body': body}
    return payload_request


def private_issue_moderation(issue_info):
    """Write the private issue in public.

    Send a GitHub PATCH to set labels and milestone for the issue.

    PATCH /repos/:owner/:repo/issues/:number
    {
        "title": "a string for the title",
        "body": "the full body",
        "labels": ['Label1', 'Label2'],
    }

    Milestone should be already set on needstriage

    we get the destination through the public_url
    """
    payload_request = prepare_accepted_issue(issue_info)
    public_number = get_public_issue_number(issue_info['public_url'])
    # Preparing the proxy request
    path = f'repos/{PUBLIC_REPO}/{public_number}'
    proxy_response = make_request('patch', path, payload_request)
    return proxy_response


def private_issue_rejected(issue_info):
    """Send a rejected moderation PATCH on the public issue."""
    payload_request = prepare_rejected_issue()
    public_number = get_public_issue_number(issue_info['public_url'])
    # Preparing the proxy request
    path = f'repos/{PUBLIC_REPO}/{public_number}'
    proxy_response = make_request('patch', path, payload_request)
    return proxy_response


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


def comment_public_uri(issue_info):
    """Publish a comment on the private issue with the public uri."""
    # issue number on private repo
    number = issue_info['number']
    # public issue data
    public_url = issue_info['public_url']
    public_number = get_public_issue_number(public_url)
    # prepare the payload
    comment_body = f'[Original issue {public_number}]({public_url})'
    payload = {'body': comment_body}
    # Preparing the proxy request
    path = f'repos/{PRIVATE_REPO}/{number}/comments'
    proxy_response = make_request('post', path, payload)
    return proxy_response
