#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""WebCompat Issue Model for webhooks."""

from typing import List
from dataclasses import dataclass, field

from webcompat import app
from webcompat.webhooks.helpers import make_request
from webcompat.webhooks.helpers import get_issue_labels
from webcompat.webhooks.helpers import get_public_issue_number
from webcompat.webhooks.helpers import prepare_accepted_issue

PUBLIC_REPO = app.config['ISSUES_REPO_URI']
PRIVATE_REPO = app.config['PRIVATE_REPO_URI']


@dataclass
class WebHookIssue:
    """WebCompat Issue Model for WebHook consumption"""
    action: str
    body: str
    domain: str
    number: int
    public_url: str
    repository_url: str
    state: str
    title: str
    original_labels: List[str]
    # These 2 need default values, so they come last
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
        # TODO: move prepare_accepted_issue into the model
        payload_request = prepare_accepted_issue(issue_info)
        public_number = get_public_issue_number(issue_info['public_url'])
        # Preparing the proxy request
        path = f'repos/{PUBLIC_REPO}/{public_number}'
        proxy_response = make_request('patch', path, payload_request)
        return proxy_response

    def prepare_public_comment(self):
        """Build the comment for the public repo."""
        # public issue data
        public_url = self.public_url
        public_number = get_public_issue_number(public_url)
        # prepare the payload
        return f'[Original issue {public_number}]({public_url})'

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
