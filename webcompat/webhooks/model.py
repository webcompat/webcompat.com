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
from webcompat.webhooks.helpers import make_response
from webcompat.webhooks.helpers import make_request
from webcompat.webhooks.helpers import msg_log
from webcompat.webhooks.helpers import oops
from webcompat.webhooks.helpers import prepare_rejected_issue
from webcompat.webhooks.helpers import repo_scope
from webcompat.issues import moderation_template

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
    host_reported_from: str

    @classmethod
    def from_dict(cls, payload, host=None):
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
        host_reported_from = ''
        if host:
            host_reported_from = host

        return cls(action=payload['action'], body=issue_body,
                   domain=domain, number=issue.get('number'),
                   public_url=public_url,
                   repository_url=issue.get('repository_url'),
                   state=issue.get('state'), title=full_title,
                   original_labels=original_labels,
                   milestone=milestone, milestoned_with=milestoned_with,
                   host_reported_from=host_reported_from)

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

    def comment_closed_reason(self, reason):
        """Publish a comment on the public issue about why it was closed."""
        if reason in ['invalid', 'incomplete']:
            comment = moderation_template(reason).get('body')
        else:
            raise ValueError("reason must be one of invalid or incomplete")
        payload = {'body': comment}
        issue_number = self.get_public_issue_number()
        path = f'repos/{PUBLIC_REPO}/{issue_number}/comments'
        make_request('post', path, payload)

    def comment_public_uri(self):
        """Publish a comment on the private issue with the public uri."""
        comment = self.prepare_public_comment()
        payload = {'body': comment}
        # Preparing the proxy request
        path = f'repos/{PRIVATE_REPO}/{self.number}/comments'
        make_request('post', path, payload)

    def comment_outreach_generator_uri(self):
        """Publish a comment on the public issue with outreach uri."""
        comment = self.prepare_outreach_comment()
        payload = {'body': comment}
        # Preparing the proxy request
        path = f'repos/{PUBLIC_REPO}/{self.number}/comments'
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

    def prepare_accepted_issue(self, milestone=None):
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
        if milestone:
            milestone_id = app.config['STATUSES'][f'{milestone}']['id']
            payload_request['milestone'] = milestone_id
            payload_request['state'] = 'closed'
        return payload_request

    def prepare_public_comment(self):
        """Build the comment for the public repo."""
        # public issue data
        public_number = self.get_public_issue_number()
        # prepare the payload
        return f'[Original issue {public_number}]({self.public_url})'

    def prepare_outreach_comment(self):
        """Build the comment with a link to the outreach generator page."""
        host = self.host_reported_from
        if not host:
            host = "https://webcompat.com/"
        # prepare the payload
        return f'[Generate outreach template]({host}outreach/{self.number})'

    def close_public_issue(self, reason='rejected'):
        """Close a public issue for the given reason.

        Right now the accepted reasons are:
        'incomplete'
        'invalid'
        'rejected' (default)
        """
        if reason == 'incomplete':
            payload_request = self.prepare_accepted_issue('incomplete')
        elif reason == 'invalid':
            payload_request = self.prepare_accepted_issue('invalid')
        else:
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

    def process_issue_action(self):
        """Route the actions and provide different responses.

        There are two possible known scopes:
        * public repo
        * private repo

        Currently the actions we are handling are (for now):
        * opened (public repo only)
        Aka newly issues created and
        need to be assigned labels and milestones
        * milestoned
        When the issue is moved to needscontact
        When the issue is being moderated with a milestone: accepted
        """
        source_repo = self.repository_url
        scope = repo_scope(source_repo)
        # We do not process further in case
        # we don't know what we are dealing with
        if scope == 'unknown':
            return make_response('Wrong repository', 403)
        if self.action == 'opened' and scope == 'public':
            # we are setting labels on each new open issues
            try:
                self.tag_as_public()
            except HTTPError as e:
                msg_log(f'public:opened labels failed ({e})', self.number)
                return oops()
            else:
                return make_response('gracias, amigo.', 200)
        elif (self.action == 'milestoned' and scope == 'public' and
              self.milestoned_with == 'needscontact'):
            try:
                self.comment_outreach_generator_uri()
            except HTTPError as e:
                msg_log(f'comment failed ({e})', self.number)
                return oops()
            else:
                return make_response('outreach generator url added', 200)
        elif self.action == 'opened' and scope == 'private':
            # webcompat-bot needs to comment on this issue with the URL
            try:
                self.comment_public_uri()
            except HTTPError as e:
                msg_log(f'comment failed ({e})', self.number)
                return oops()
            else:
                return make_response('public url added', 200)
        elif (self.action == 'milestoned' and scope == 'private' and
              self.milestoned_with == 'accepted'):
            # private issue have been moderated and we will make it public
            try:
                self.moderate_private_issue()
            except HTTPError as e:
                msg_log('private:moving to public failed', self.number)
                return oops()
            else:
                # we didn't get exceptions, so it's safe to close it
                self.close_private_issue()
                return make_response('Moderated issue accepted', 200)
        elif (self.action == 'milestoned' and scope == 'private' and
              self.milestoned_with == 'accepted: incomplete'):
            # The private issue has been set to the "accepted: incomplete"
            # milestone. This will close the public and private issues, and
            # leave a message for the incomplete issue.
            try:
                self.close_public_issue(reason='incomplete')
            except HTTPError as e:
                msg_log(
                    'private:closing public issue as incomplete failed',
                    self.number)
                return oops()
            else:
                # we didn't get exceptions, so it's safe to comment why
                # it was closed as incomplete, and close it.
                self.comment_closed_reason(reason='incomplete')
                self.close_private_issue()
                return make_response('Moderated issue closed as incomplete',
                                     200)
        elif (self.action == 'milestoned' and scope == 'private' and
              self.milestoned_with == 'accepted: invalid'):
            # The private issue has been set to the "accepted: invalid"
            # milestone. This will close the public and private issues, and
            # leave a message for the invalid issue.
            try:
                self.close_public_issue(reason='invalid')
            except HTTPError as e:
                msg_log(
                    'private:closing public issue as invalid failed',
                    self.number)
                return oops()
            else:
                # we didn't get exceptions, so it's safe to comment why
                # it was closed as invalid, and close it.
                self.comment_closed_reason(reason='invalid')
                self.close_private_issue()
                return make_response('Moderated issue closed as invalid', 200)
        elif (scope == 'private' and self.action == 'closed' and
              self.milestone == 'unmoderated'):
            # The private issue has been closed. It is rejected and the
            # private and public issues will be closed with a rejected message.
            try:
                self.close_public_issue(reason='rejected')
            except HTTPError as e:
                msg_log('public rejection failed', self.number)
                return oops()
            else:
                # we didn't get exceptions, so it's safe to close it
                self.close_private_issue()
                return make_response('Moderated issue rejected', 200)
        else:
            return make_response('Not an interesting hook', 403)
