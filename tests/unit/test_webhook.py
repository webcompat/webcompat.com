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
from mock import patch

import webcompat
from webcompat.db import Site
from webcompat.helpers import to_bytes
from webcompat.webhooks import helpers


# The key is being used for testing and computing the signature.
# The key needs to be a bytes object
key = to_bytes(webcompat.app.config['HOOK_SECRET_KEY'])


# Some machinery for opening our test files
def event_data(filename):
    """Return a tuple with the content and its signature."""
    current_root = os.path.realpath(os.curdir)
    events_path = 'tests/fixtures/webhooks'
    path = os.path.join(current_root, events_path, filename)
    with open(path, 'r') as f:
        json_event = json.dumps(json.load(f))
    signature = 'sha1={sig}'.format(
        sig=helpers.get_payload_signature(key, json_event))
    return json_event, signature


class TestWebhook(unittest.TestCase):
    """Tests for our WebHook code."""

    def setUp(self):
        """Set up tests."""
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
        <!-- @extra_labels: type-media, type-stylo -->

        **URL**: https://www.example.com/
        **Browser / Version**: Firefox 55.0
        <!-- @browser: Chrome 48.0 -->
        """

        self.issue_body2 = """
        <!-- @browser: Foobar -->
        <!-- @extra_labels: type-foobar -->
        """
        self.issue_body3 = """
        **URL**: https://www.google.com/
        <!-- @browser: Firefox Mobile (Tablet) 40.0 -->
        """
        self.issue_body4 = """
        **URL**: https://www.google.com/
        <!-- @browser: Firefox Mobile (Tablet) 40.0 -->
        """

    def tearDown(self):
        """Tear down tests."""
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
        self.assertEqual(rv.data, b'Nothing to see here')
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
        self.assertEqual(rv.data, b'Nothing to see here')
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
        self.assertEqual(rv.data, b'Not an interesting hook')

    def test_success_on_ping_event(self):
        """POST with PING events just return a 200 and contains pong."""
        json_event, signature = event_data('new_event_valid.json')
        self.headers.update({'X-GitHub-Event': 'ping',
                             'X-Hub-Signature': signature})
        rv = self.app.post(self.test_url,
                           data=json_event,
                           headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        self.assertIn(b'pong', rv.data)

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
        self.assertEqual(rv.data, b'Not an interesting hook')

    def test_extract_metadata(self):
        """Extract dictionary of metadata for an issue body."""
        expected = {'reported_with': 'web',
                    'extra_labels': 'type-media, type-stylo',
                    'ua_header': ('Mozilla/5.0 (what) Gecko/20100101 '
                                  'Firefox/55.0'),
                    'browser': 'Firefox 55.0'}
        actual = helpers.extract_metadata(self.issue_body)
        self.assertEqual(expected, actual)

    def test_extract_browser_label(self):
        """Extract browser label name."""
        metadata_tests = [
            ({'browser': 'Firefox'}, 'browser-fixme'),
            ({'browser': 'Firefox Mobile'}, 'browser-fixme'),
            ({'browser': 'Firefox99.0'}, 'browser-fixme'),
            ({'browser': 'Firefox (tablet)'}, 'browser-fixme'),
            ({'browser': 'Firefox 30.0'}, 'browser-firefox'),
            ({'browser': 'Firefox Mobile 30.0'}, 'browser-firefox-mobile'),
            ({'browser': 'Firefox Mobile (Tablet) 88.0'}, 'browser-firefox-tablet'),  # noqa
            ({'browser': 'Firefox Mobile Nightly 59.0a1 (2017-12-04)'}, 'browser-firefox-mobile'),  # noqa
            ({'browser': 'Mozilla/5.0 (Android 8.0.0; Mobile; rv:58.0) Gecko/58.0 Firefox/58.0'}, 'browser-fixme'),  # noqa
            ({'browser': 'Firefox Developer Edition 60.0b14 (64-bit)'}, 'browser-firefox'),  # noqa
            ({'browser': 'Firefox Mobile Nightly 61.0 & Firefox PC Nightly'}, 'browser-firefox-mobile'),  # noqa
            ({'browser': 'LOL Mobile 55.0'}, 'browser-fixme'),
            ({'browser': 'LOL Mobile 55.0',
             'extra_labels': 'browser-focus-geckoview'}, 'browser-fixme'),
             ({'browser': 'Firefox 30.0',
             'extra_labels': 'browser-focus-geckoview'}, 'browser-firefox'),
            ({}, 'browser-fixme'),
        ]
        for metadata_dict, expected in metadata_tests:
            actual = helpers.extract_browser_label(metadata_dict)
            self.assertEqual(expected, actual)

    def test_extract_extra_labels(self):
        """Extract 'extra' label."""
        metadata_tests = [
            ({'extra_labels': 'type-media'}, ['type-media']),
            ({'extra_labels': 'browser-focus-geckoview'},
             ['browser-focus-geckoview']),
            ({'extra_labels': 'cool, dude'}, ['cool', 'dude']),
            ({'extra_labels': 'weather-☁'}, ['weather-☁']),
            ({'extra_labels': 'weather-É'}, ['weather-é']),
            ({'burgers': 'french fries'}, None),
        ]
        for metadata_dict, expected in metadata_tests:
            actual = helpers.extract_extra_labels(metadata_dict)
            self.assertEqual(expected, actual)

    def test_extract_priority_label(self):
        """Extract priority label."""
        with patch('webcompat.db.site_db.query') as db_mock:
            db_mock.return_value.filter_by.return_value = [
                Site('google.com', 1, '', 1)]
            priority_label = helpers.extract_priority_label(self.issue_body3)
            self.assertEqual(priority_label, 'priority-critical')
        priority_label_none = helpers.extract_priority_label(self.issue_body)
        self.assertEqual(priority_label_none, None)

    def test_get_issue_labels(self):
        """Extract list of labels from an issue body."""
        labels_tests = [
            (self.issue_body, ['browser-firefox', 'type-media', 'type-stylo']),
            (self.issue_body2, ['browser-fixme', 'type-foobar']),
            (self.issue_body3, ['browser-firefox-tablet'])
        ]
        for issue_body, expected in labels_tests:
            actual = helpers.get_issue_labels(issue_body)
            self.assertEqual(sorted(expected), sorted(actual))

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

    def test_signature_check(self):
        """Test the signature check function for WebHooks."""
        payload = 'A body'
        key = 'SECRET'
        post_signature = 'sha1=abacb5cff87d9e0122683d0d1d18a150809ac700'
        self.assertTrue(helpers.signature_check(key, post_signature, payload))
        post_signature = 'abacb5cff87d9e0122683d0d1d18a150809ac700'
        self.assertFalse(helpers.signature_check(key, post_signature, payload))
        post_signature = 'sha1='
        self.assertFalse(helpers.signature_check(key, post_signature, payload))
        post_signature = 'sha1=wrong'
        self.assertFalse(helpers.signature_check(key, post_signature, payload))

    def test_new_opened_issue(self):
        """Test the core actions on new opened issues for WebHooks."""
        # A 200 response
        json_event, signature = event_data('new_event_valid.json')
        payload = json.loads(json_event)
        with patch('webcompat.webhooks.helpers.proxy_request') as proxy:
            proxy.return_value.status_code = 200
            response = helpers.new_opened_issue(payload)
            self.assertEqual(response.status_code, 200)
            # A 401 response
            proxy.return_value.status_code = 401
            proxy.return_value.content = '{"message":"Bad credentials","documentation_url":"https://developer.github.com/v3"}'  # noqa
            with patch.dict('webcompat.webhooks.helpers.app.config',
                            {'OAUTH_TOKEN': ''}):
                response = helpers.new_opened_issue(payload)
                self.assertEqual(response.status_code, 401)
                self.assertTrue('Bad credentials' in response.content)


if __name__ == '__main__':
    unittest.main()
