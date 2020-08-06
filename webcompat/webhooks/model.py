#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""WebCompat Issue Model for webhooks."""

from dataclasses import dataclass
from dataclasses import field
from typing import Any
from typing import Dict
from typing import List

from requests.exceptions import HTTPError

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
    action: str
    body: str
    domain: str
    number: int
    public_url: str
    repository_url: str
    state: str
    title: str
    original_labels: List[str]
    milestone: str
    milestoned_with: str

    @classmethod
    def from_dict(cls, payload):
        """Class method to allow instantiation from a GitHub response dict."""
        # Extract the title and the body
        issue = payload['issue']
        full_title = issue.get('title', 'Weird_Title - Inspect')
        labels = issue.get('labels', [])
        issue_body = issue['body']
        domain = full_title.partition(' ')[0]
        public_url = extract_metadata(issue_body).get('public_url', '').strip()
        original_labels = [label['name'] for label in labels]
        # webhook with a milestone already set
        milestone = ''
        if issue.get('milestone'):
            milestone = issue['milestone']['title']
        # webhook with a milestoned action
        milestoned_with = ''
        if payload.get('milestone'):
            milestoned_with = payload.get('milestone')['title']

        return cls(action=payload['action'], body=issue_body,
                   domain=domain, number=issue.get('number'),
                   public_url=public_url,
                   repository_url=issue.get('repository_url'),
                   state=issue.get('state'), title=full_title,
                   original_labels=original_labels,
                   milestone=milestone, milestoned_with=milestoned_with)

    def close_private_issue(self):
        """Mark the private issue as closed."""
        path = f'repos/{PRIVATE_REPO}/{self.number}'
        try:
            make_request('patch', path, {'state': 'closed'})
        except HTTPError as e:
            # pass the error up to process_issue_action
            raise e
        else:
            self.state = 'closed'

    def comment_public_uri(self):
        """Publish a comment on the private issue with the public uri."""
        comment = self.prepare_public_comment()
        payload = {'body': comment}
        # Preparing the proxy request
        path = f'repos/{PRIVATE_REPO}/{self.number}/comments'
        make_request('post', path, payload)

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

        we get the destination through the public_url.
        """
        payload_request = self.prepare_accepted_issue()
        public_number = self.get_public_issue_number()
        # Preparing the proxy request
        path = f'repos/{PUBLIC_REPO}/{public_number}'
        make_request('patch', path, payload_request)

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
        public_number = self.get_public_issue_number()
        # prepare the payload
        return f'[Original issue {public_number}]({self.public_url})'

    def reject_private_issue(self):
        """Send a rejected moderation PATCH on the public issue."""
        payload_request = prepare_rejected_issue()
        public_number = self.get_public_issue_number()
        # Preparing the proxy request
        path = f'repos/{PUBLIC_REPO}/{public_number}'
        make_request('patch', path, payload_request)

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
        make_request('patch', path, payload_request)

    def get_public_issue_number(self):
        """Extract the issue number from the public url."""
        url = self.public_url
        if url:
            url = self.public_url.strip().rsplit('/', 1)[1]
        return url
