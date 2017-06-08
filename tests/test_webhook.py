#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our webhooks."""

import json
import os
import sys
import unittest

import flask

from webcompat import app
from webcompat.webhooks import helpers

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat  # nopep8

# The key is being used for testing and computing the signature.
key = app.config['HOOK_SECRET_KEY']

# a fake type-media issues list for testing
ISSUES_LIST = ['600 NS_ERROR_DOM_MEDIA_DEMUXER_ERR www.chia-anime.tv',
               '430 NS_ERROR_DOM_MEDIA_METADATA_ERR example.com',
               '9 NS_ERROR_DOM_MEDIA_DEMUXER_ERR example.com',
               '69 NS_ERROR_DOM_MEDIA_DEMUXER_ERR example.org']


# Some machinery for opening our test files
def event_data(filename):
    '''return a tuple with the content and its signature.'''
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
        webcompat.app.config['TESTING'] = True
        self.client = webcompat.app.test_client()
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

    def tearDown(self):
        pass

    def test_forbidden_get(self):
        """GET is forbidden on labeler webhook."""
        rv = self.client.get(self.test_url, headers=self.headers)
        self.assertEqual(rv.status_code, 404)

    def test_fail_on_missing_signature(self):
        """POST without signature on labeler webhook is forbidden."""
        self.headers.update({'X-GitHub-Event': 'ping'})
        rv = self.client.post(self.test_url, headers=self.headers)
        self.assertEqual(rv.status_code, 401)

    def test_fail_on_bogus_signature(self):
        """POST without bogus signature on labeler webhook is forbidden."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'ping',
                             'X-Hub-Signature': 'Boo!'})
        rv = self.client.post(self.test_url,
                              data=json_event,
                              headers=self.headers)
        self.assertEqual(rv.status_code, 401)

    def test_fail_on_invalid_event_type(self):
        """POST with event not being 'issues' or 'ping' fails."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'failme',
                             'X-Hub-Signature': signature})
        rv = self.client.post(self.test_url,
                              data=json_event,
                              headers=self.headers)
        self.assertEqual(rv.status_code, 403)

    def test_success_on_ping_event(self):
        """POST with PING events just return a 200 and contains pong."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'ping',
                             'X-Hub-Signature': signature})
        rv = self.client.post(self.test_url,
                              data=json_event,
                              headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        self.assertIn('pong', rv.data)

    def test_fails_on_not_known_action(self):
        """POST with action different of opened fails."""
        json_event, signature = event_data('new_event_invalid.json')
        self.headers.update({'X-GitHub-Event': 'issues',
                             'X-Hub-Signature': signature})
        rv = self.client.post(self.test_url,
                              data=json_event,
                              headers=self.headers)
        self.assertEqual(rv.status_code, 403)
        self.assertIn('Not an interesting hook', rv.data)

    def test_extract_browser_label(self):
        """Extract browser label name."""
        browser_label = helpers.extract_browser_label(self.issue_body)
        self.assertEqual(browser_label, 'browser-firefox')
        browser_label_none = helpers.extract_browser_label(self.issue_body2)
        self.assertEqual(browser_label_none, None)

    def test_is_github_hook(self):
        """Define if the GitHub request is valid."""
        json_event, signature = event_data('new_event_invalid.json')
        # Lack the X-GitHub-Event
        with webcompat.app.test_client() as client:
            headers = self.headers.copy()
            headers.update({'X-Hub-Signature': signature})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request)
        # Lack the X-Hub-Signature
        with webcompat.app.test_client() as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues'})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request)
        # X-Hub-Signature is wrong
        with webcompat.app.test_client() as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues',
                            'X-Hub-Signature': 'failme'})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request)
        # Everything is fine
        with webcompat.app.test_client() as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues',
                            'X-Hub-Signature': signature})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertTrue(webhook_request)

    def test_extract_media_info(self):
        """Extract the information for type-media issue."""
        json_event, signature = event_data('type-media-event.json')
        payload = json.loads(json_event)
        body = payload['issue']['body']
        expected = ('NS_ERROR_DOM_MEDIA_DEMUXER_ERR', 'www.chia-anime.tv')
        actual = helpers.extract_media_info(body)
        self.assertTupleEqual(expected, actual)

    def test_extract_media_info_fails(self):
        """Fails scenario for type-media parsing."""
        body = ''
        actual = helpers.extract_media_info(body)
        self.assertIsNone(actual)

    def test_known_type_media(self):
        """Check if the issue is already in the list of known type-media.

        Scenarios:
        1. the issue is already in the list with the same issue number.
           (nothing to do. Might happen with change of labels.)
           True
        2. the issue is in the list with same error code and domain,
           but different issue number. (duplicate)
           True
        3. the issue is not in the list, add it.
        """
        json_event, signature = event_data('type-media-event.json')
        payload = json.loads(json_event)
        body = payload['issue']['body']
        issue_number = payload['issue']['number']
        self.assertTrue(
            helpers.is_known_media(issue_number, body, ISSUES_LIST))


if __name__ == '__main__':
    unittest.main()
