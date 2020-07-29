#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""WebCompat Issue Model for webhooks."""

from dataclasses import dataclass
from dataclasses import field
from dataclasses import InitVar
from typing import Any
from typing import Dict
from typing import List

from webcompat import app
from webcompat.webhooks.helpers import extract_metadata
from webcompat.webhooks.helpers import get_issue_labels
from webcompat.webhooks.helpers import make_request
from webcompat.webhooks.helpers import prepare_rejected_issue

PUBLIC_REPO = app.config['ISSUES_REPO_URI']
PRIVATE_REPO = app.config['PRIVATE_REPO_URI']


@dataclass
class WebHookIssue:
    """WebCompat Issue Model for WebHook consumption"""
    payload: InitVar[Dict[str, Any]]
    action: str = field(init=False)
    body: str = field(init=False)
    domain: str = field(init=False)
    number: int = field(init=False)
    public_url: str = field(init=False)
    repository_url: str = field(init=False)
    state: str = field(init=False)
    title: str = field(init=False)
    original_labels: List[str] = field(init=False)
    milestone: str = ''
    milestoned_with: str = ''

    def close_private_issue(self):
        """Mark the private issue as closed."""
        path = f'repos/{PRIVATE_REPO}/{self.number}'
        self.state = 'closed'
        make_request('patch', path, {'state': self.state})

    def comment_public_uri(self):
        """Publish a comment on the private issue with the public uri."""
        payload = {'body': self.prepare_public_comment()}
        # Preparing the proxy request
        path = f'repos/{PRIVATE_REPO}/{self.number}/comments'
        proxy_response = make_request('post', path, payload)
        return proxy_response

    def moderate_private_issue(self):
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
        payload_request = self.prepare_accepted_issue()
        public_number = WebHookIssue.get_public_issue_number(self.public_url)
        # Preparing the proxy request
        path = f'repos/{PUBLIC_REPO}/{public_number}'
        proxy_response = make_request('patch', path, payload_request)
        return proxy_response

    def prepare_accepted_issue(self):
        """Create the payload for the accepted moderated issue.

        When the issue has been moderated as accepted,
        we need to change a couple of things in the public space

        - Title
        - Body
        - Any labels from the private issue
        """
        # Gets the labels from the body
        labels = get_issue_labels(self.body)
        labels.extend(self.original_labels)
        # Let's remove action-needsmoderation in case it's here
        if 'action-needsmoderation' in labels:
            labels.remove('action-needsmoderation')
        # Prepares the payload
        payload_request = {
            'labels': labels,
            'title': self.title,
            'body': self.body
        }
        return payload_request

    def prepare_public_comment(self):
        """Build the comment for the public repo."""
        # public issue data
        public_url = self.public_url
        public_number = WebHookIssue.get_public_issue_number(public_url)
        # prepare the payload
        return f'[Original issue {public_number}]({public_url})'

    def reject_private_issue(self):
        """Send a rejected moderation PATCH on the public issue."""
        payload_request = prepare_rejected_issue()
        public_number = WebHookIssue.get_public_issue_number(
            issue_info['public_url'])
        # Preparing the proxy request
        path = f'repos/{PUBLIC_REPO}/{public_number}'
        proxy_response = make_request('patch', path, payload_request)
        return proxy_response

    def tag_as_public(self):
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
        # Grabs the labels already set so they will not be erased
        # Gets the labels from the body
        labels = get_issue_labels(self.body)
        labels.extend(self.original_labels)
        self.milestone = app.config['STATUSES']['needstriage']['id']
        # Preparing the proxy request to the public repo
        path = f'repos/{PUBLIC_REPO}/{self.number}'
        payload_request = {'labels': labels, 'milestone': self.milestone}
        proxy_response = make_request('patch', path, payload_request)
        return proxy_response

    @staticmethod
    def get_public_issue_number(public_url):
        """Extract the issue number from the public url."""
        public_number = public_url.strip().rsplit('/', 1)[1]
        return public_number

    def __post_init__(self, payload):
        """Build up the model from the initial WebHook payload."""
        # Extract the title and the body
        issue = payload.get('issue')
        full_title = issue.get('title', 'Weird_Title - Inspect')
        labels = issue.get('labels', [])
        issue_body = issue.get('body')
        public_url = extract_metadata(issue_body).get('public_url', '')
        # Create the issue dictionary
        self.action = payload.get('action')
        self.body = issue_body
        self.domain = full_title.partition(' ')[0]
        self.number = issue.get('number')
        self.public_url = public_url.strip()
        self.repository_url = issue.get('repository_url')
        self.state = issue.get('state')
        self.title = full_title
        self.original_labels = [label['name'] for label in labels]
        # webhook with a milestone already set
        if issue.get('milestone'):
            self.milestone = issue['milestone']['title']
        # webhook with a milestoned action
        if payload.get('milestone'):
            self.milestoned_with = payload.get('milestone')['title']
