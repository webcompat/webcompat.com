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
        **URL**: https://www.example.com/
        <!-- @browser: Firefox Mobile (Tablet) 40.0 -->
        """
        self.issue_body4 = """
        **URL**: https://www.example.com/
        <!-- @browser: Firefox Mobile (Tablet) 40.0 -->
        """

        self.issue_body5 = """
        <!-- @browser: Android 8.1.0 -->
        <!-- @ua_header: Mozilla/5.0 (Android 8.1.0; Mobile VR; rv:65.0) Gecko/65.0 Firefox/65.0 -->
        <!-- @reported_with: browser-fxr -->
        <!-- @extra_labels: browser-firefox-reality, type-media -->

        **URL**: https://vrporn.com/closing-shift-shaft/

        **Browser / Version**: Android 8.1.0
        **Operating System**: Android 8.1.0
        **Tested Another Browser**: Yes
        """  # noqa

        self.issue_body6 = u"""
        **URL**: https://not-gecko.example.com/
        <!-- @browser: Safari 99.0 -->
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
            (self.issue_body, ['browser-firefox', 'type-media', 'type-stylo',
                               'engine-gecko']),
            (self.issue_body2, ['browser-fixme', 'type-foobar']),
            (self.issue_body3, ['browser-firefox-tablet', 'engine-gecko']),
            (self.issue_body5, ['browser-firefox-reality', 'engine-gecko',
                                'type-media']),
            (self.issue_body6, ['browser-safari']),
        ]
        for issue_body, expected in labels_tests:
            actual = helpers.get_issue_labels(issue_body)
            self.assertEqual(sorted(expected), sorted(actual))

    def test_is_github_hook_missing_x_github_event(self):
        """Validation tests for GitHub Webhooks: Missing X-GitHub-Event."""
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

    def test_is_github_hook_missing_x_hub_signature(self):
        """Validation tests for GitHub Webhooks: Missing X-Hub-Signature."""
        json_event, signature = event_data('new_event_invalid.json')
        # Lack the X-Hub-Signature
        with self.app as client:
            headers = self.headers.copy()
            headers.update({'X-GitHub-Event': 'issues'})
            client.post(self.test_url,
                        data=json_event,
                        headers=headers)
            webhook_request = helpers.is_github_hook(flask.request)
            self.assertFalse(webhook_request, 'X-Hub-Signature is missing')

    def test_is_github_hook_wrong_signature(self):
        """Validation tests for GitHub Webhooks: Wrong X-Hub-Signature."""
        json_event, signature = event_data('new_event_invalid.json')
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

    def test_is_github_hook_everything_ok(self):
        """Validation tests for GitHub Webhooks: Everything ok."""
        json_event, signature = event_data('new_event_invalid.json')
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
        expected = {'number': 600, 'repository_url': 'https://api.github.com/repos/webcompat/webcompat-tests', 'action': 'foobar', 'domain': 'www.netflix.com'}  # noqa
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

    @patch('webcompat.webhooks.helpers.new_opened_issue')
    def test_new_issue_right_repo(self, mock_proxy):
        """Test that repository_url matches the CONFIG for public repo.

        Success is:
        payload: 'gracias amigos'
        status: 200
        content-type: text/plain
        """
        json_event, signature = event_data('new_event_valid.json')
        headers = {
            'X-GitHub-Event': 'issues',
            'X-Hub-Signature': signature,
        }
        with webcompat.app.test_client() as c:
            mock_proxy.return_value.status_code = 200
            rv = c.post(
                '/webhooks/labeler',
                data=json_event,
                headers=headers
            )
            self.assertEqual(rv.data, b'gracias, amigo.')
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'text/plain')

    def test_new_issue_wrong_repo(self):
        """Test when repository_url differs from the CONFIG for public repo.

        In this case the error message is
        payload: 'Wrong repository'
        status: 403
        content-type: text/plain.
        """
        json_event, signature = event_data('wrong_repo.json')
        headers = {
            'X-GitHub-Event': 'issues',
            'X-Hub-Signature': signature,
        }
        with webcompat.app.test_client() as c:
            rv = c.post(
                '/webhooks/labeler',
                data=json_event,
                headers=headers
            )
            self.assertEqual(rv.data, b'Wrong repository')
            self.assertEqual(rv.status_code, 403)
            self.assertEqual(rv.content_type, 'text/plain')

    def test_repo_scope_public(self):
        """Test the public scope of the repository."""
        url = 'https://api.github.com/repos/webcompat/webcompat-tests'
        expected = 'public'
        actual = helpers.repo_scope(url)
        self.assertEqual(expected, actual)

    def test_repo_scope_private(self):
        """Test the private scope of the repository."""
        url = 'https://api.github.com/repos/webcompat/webcompat-tests-private'
        expected = 'private'
        actual = helpers.repo_scope(url)
        self.assertEqual(expected, actual)

    def test_repo_scope_unknown(self):
        """Test the unknown of the repository."""
        url = 'https://api.github.com/repos/webcompat/webcompat-foobar'
        expected = 'unknown'
        actual = helpers.repo_scope(url)
        self.assertEqual(expected, actual)

    def test_patch_acceptable_issue(self):
        """Test for acceptable issues comes from private repo.

        payload: 'Moderated issue accepted'
        status: 200
        content-type: text/plain
        """
        raise unittest.SkipTest('TODO')

    def test_patch_not_acceptable_issue(self):
        """Test for rejected issues from private repo.

        payload: 'Moderated issue rejected'
        status: 200
        content-type: text/plain
        """
        raise unittest.SkipTest('TODO')

    def test_patch_wrong_repo_for_moderation(self):
        """Test for issues in the wrong repo.

        payload: 'Wrong repository'
        status: 403
        content-type: text/plain
        """
        raise unittest.SkipTest('TODO')


if __name__ == '__main__':
    unittest.main()
