#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our webhooks."""

import json
import os
import unittest

import flask

import webcompat
from webcompat.webhooks import helpers

# The key is being used for testing and computing the signature.
key = webcompat.app.config['HOOK_SECRET_KEY']


# Some machinery for opening our test files
def event_data(filename):
    """return a tuple with the content and its signature."""
    current_root = os.path.realpath(os.curdir)
    events_path = 'tests/fixtures/webhooks'
    path = os.path.join(current_root, events_path, filename)
    with open(path, 'r') as f:
        json_event = json.dumps(json.load(f))
    signature = 'sha1={sig}'.format(
        sig=helpers.get_payload_signature(key, json_event))
    return json_event, signature


class TestWebhook(unittest.TestCase):
    def setUp(self):
        # sets a more detailed message when testing.
        self.longMessage = True
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()
        self.headers = {'content-type': 'application/json'}
        self.test_url = '/webhooks/labeler'
        self.issue_body = """
        <!-- @browser: Firefox 55.0 -->
        <!-- @ua_header: Mozilla/5.0 (what) Gecko/20100101 Firefox/55.0 -->
        <!-- @reported_with: web -->

        **URL**: https://www.example.com/
        **Browser / Version**: Firefox 55.0
        <!-- @browser: Chrome 48.0 -->
        """
        self.issue_body2 = """
        <!-- @browser: Foobar -->
        """
        self.issue_body3 = """
        <!-- @browser: Firefox Mobile (Tablet) 40.0 -->
        """

    def tearDown(self):
        pass

    def test_forbidden_get(self):
        """GET is forbidden on labeler webhook."""
        rv = self.app.get(self.test_url, headers=self.headers)
        self.assertEqual(rv.status_code, 404)

    def test_fail_on_missing_signature(self):
        """POST without signature on labeler webhook is forbidden."""
        self.headers.update({'X-GitHub-Event': 'ping'})
        rv = self.app.post(self.test_url, headers=self.headers)
        self.assertEqual(rv.status_code, 401)
        self.assertEqual(rv.data, 'Nothing to see here')
        self.assertEqual(rv.mimetype, 'text/plain')

    def test_fail_on_bogus_signature(self):
        """POST without bogus signature on labeler webhook is forbidden."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'ping',
                             'X-Hub-Signature': 'Boo!'})
        rv = self.app.post(self.test_url,
                           data=json_event,
                           headers=self.headers)
        self.assertEqual(rv.status_code, 401)
        self.assertEqual(rv.data, 'Nothing to see here')
        self.assertEqual(rv.mimetype, 'text/plain')

    def test_fail_on_invalid_event_type(self):
        """POST with event not being 'issues' or 'ping' fails."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'failme',
                             'X-Hub-Signature': signature})
        rv = self.app.post(self.test_url,
                           data=json_event,
                           headers=self.headers)
        self.assertEqual(rv.status_code, 403)
        self.assertEqual(rv.mimetype, 'text/plain')
        self.assertEqual(rv.data, 'Not an interesting hook')

    def test_success_on_ping_event(self):
        """POST with PING events just return a 200 and contains pong."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'ping',
                             'X-Hub-Signature': signature})
        rv = self.app.post(self.test_url,
                           data=json_event,
                           headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        self.assertIn('pong', rv.data)

    def test_fails_on_not_known_action(self):
        """POST with an unknown action fails."""
        json_event, signature = event_data('new_event_invalid.json')
        self.headers.update({'X-GitHub-Event': 'issues',
                             'X-Hub-Signature': signature})
        rv = self.app.post(self.test_url,
                           data=json_event,
                           headers=self.headers)
        self.assertEqual(rv.status_code, 403)
        self.assertEqual(rv.mimetype, 'text/plain')
        self.assertEqual(rv.data, 'Not an interesting hook')

    def test_extract_browser_label(self):
        """Extract browser label name."""
        browser_label = helpers.extract_browser_label(self.issue_body)
        self.assertEqual(browser_label, 'browser-firefox')
        browser_label_none = helpers.extract_browser_label(self.issue_body2)
        self.assertEqual(browser_label_none, None)
        browser_label_paren = helpers.extract_browser_label(self.issue_body3)
        self.assertEqual(browser_label_paren, 'browser-firefox-mobile-tablet')

    def test_is_github_hook(self):
        """Validation tests for GitHub Webhooks."""
        json_event, signature = event_data('new_event_invalid.json')
        # Lack the X-GitHub-Event
        with self.app as client:
            headers = self.headers.copy()
            headers.update({'X-Hub-Signature': signature})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request, 'X-GitHub-Event is missing')
        # Lack the X-Hub-Signature
        with self.app as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues'})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request, 'X-Hub-Signature is missing')
        # X-Hub-Signature is wrong
        with self.app as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues',
                            'X-Hub-Signature': 'failme'})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request, 'X-Hub-Signature is wrong')
        # Everything is fine
        with self.app as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues',
                            'X-Hub-Signature': signature})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertTrue(webhook_request,
                            'X-GitHub-Event and X-Hub-Signature are correct')

    def test_get_issue_info(self):
        """Extract the right information from an issue."""
        json_event, signature = event_data('new_event_invalid.json')
        payload = json.loads(json_event)
        expected = {'number': 600,
                    'action': 'foobar',
                    'domain': 'www.chia-anime.tv'}
        actual = helpers.get_issue_info(payload)
        self.assertDictEqual(expected, actual)


if __name__ == '__main__':
    unittest.main()
