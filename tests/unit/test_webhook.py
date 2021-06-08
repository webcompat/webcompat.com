#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our webhooks: HTTP handling and helper methods."""

import json
import os
import unittest
from unittest.mock import patch

import flask
import pytest
from requests.exceptions import ConnectionError

import webcompat

from webcompat.db import Site
from webcompat.helpers import to_bytes
from webcompat.webhooks import helpers, ml


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
        self.maxDiff = None
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()
        self.headers = {'content-type': 'application/json'}
        self.test_url = '/webhooks/labeler'
        self.issue_body = """
        <!-- @browser: Firefox 55.0 -->
        <!-- @ua_header: Mozilla/5.0 (what) Gecko/20100101 Firefox/55.0 -->
        <!-- @reported_with: web -->
        <!-- @extra_labels: type-media, type-stylo -->
        <!-- @public_url: https://foo.example.org/issues/1 -->

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

        self.issue_body6 = """
        **URL**: https://not-gecko.example.com/
        <!-- @browser: Safari 99.0 -->
        """

        self.issue_body7 = """
        **URL**: https://not-gecko.example.com/
        <!-- @public_url: http://test.example.org/issues/1 -->
        """

        self.issue_body8 = """
        <!-- @browser: Firefox iOS 31.0 -->
        <!-- @ua_header: Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/31.0  Mobile/15E148 Safari/605.1.15 -->
        <!-- @reported_with: mobile-reporter -->
        <!-- @extra_labels: browser-firefox-ios -->
        <!-- @public_url: https://github.com/webcompat/web-bugs/issues/67156 -->


        **URL**: https://example.com/

        **Browser / Version**: Firefox iOS 31.0
        **Operating System**: iOS 14.4
        **Tested Another Browser**: Yes Safari
        """  # noqa

        self.issue_body9 = """
        <!-- @browser: Firefox iOS 33.1 -->
        <!-- @ua_header: Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/33.1  Mobile/15E148 Safari/605.1.15 -->
        <!-- @reported_with: mobile-reporter -->


        **URL**: https://example.com/

        **Browser / Version**: Firefox iOS 33.1
        **Operating System**: iOS 14.5
        **Tested Another Browser**: No
        """  # noqa

        self.issue_body10 = """
        <!-- @browser: Firefox iOS 34.1 -->
        <!-- @ua_header: Mozilla/5.0 (iPad; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/33.1  Mobile/15E148 Safari/605.1.15 -->
        <!-- @reported_with: mobile-reporter -->
        <!-- @extra_labels: browser-firefox-ios, device-tablet -->


        **URL**: https://example.com/

        **Browser / Version**: Firefox iOS 34.1
        **Operating System**: iOS 14.5
        **Tested Another Browser**: No
        """  # noqa

        self.issue_body11 = """
        <!-- @browser: Safari 13.1 -->
        <!-- @ua_header: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15 -->
        <!-- @reported_with: mobile-reporter -->
        <!-- @extra_labels: browser-firefox-ios, device-tablet -->

        **URL**: http://mozilla.org/

        **Browser / Version**: Safari 13.1
        **Operating System**: Mac OS X 10.15.4
        **Tested Another Browser**: Yes Edge
        """  # noqa

        self.issue_info1 = {
            'action': 'foobar',
            'state': 'open',
            'body': '<!-- @browser: Firefox 55.0 -->\n'
            '<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) '
            'Gecko/20100101 Firefox/55.0 -->\n'
            '<!-- @reported_with: web -->\n'
            '\n'
            '**URL**: https://www.netflix.com/',
            'domain': 'www.netflix.com',
            'number': 600,
            'original_labels': [],
            'public_url': '',
            'repository_url':
                'https://api.github.com/repos/webcompat/webcompat-tests',
            'title': 'www.netflix.com - test invalid event'}

        self.issue_info2 = {
            'action': 'milestoned',
            'state': 'open',
            'milestoned_with': 'accepted',
            'milestone': 'accepted',
            'body': '<!-- @browser: Firefox 55.0 -->\n'
            '<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) '
            'Gecko/20100101 Firefox/55.0 -->\n'
            '<!-- @reported_with: web -->\n'
            '<!-- @public_url: '
            'https://github.com/webcompat/webcompat-tests/issues/1  -->\n'
            '\n'
            '**URL**: https://www.netflix.com/',
            'domain': 'www.netflix.com',
            'number': 600,
            'original_labels': ['action-needsmoderation'],
            'public_url':
                'https://github.com/webcompat/webcompat-tests/issues/1',
            'repository_url':
                'https://api.github.com/repos/webcompat/webcompat-tests-private',  # noqa
            'title': 'www.netflix.com - test private issue accepted'}

        self.issue_info3 = {
            'action': 'closed',
            'state': 'closed',
            'body': '<!-- @browser: Firefox 55.0 -->\n'
            '<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) '
            'Gecko/20100101 Firefox/55.0 -->\n'
            '<!-- @reported_with: web -->\n'
            '<!-- @public_url: '
            'https://github.com/webcompat/webcompat-tests/issues/1  -->\n'
            '\n'
            '**URL**: https://www.netflix.com/',
            'domain': 'www.netflix.com',
            'number': 600,
            'original_labels': ['action-needsmoderation'],
            'public_url':
                'https://github.com/webcompat/webcompat-tests/issues/1',
            'repository_url':
                'https://api.github.com/repos/webcompat/webcompat-tests-private',  # noqa
            'title': 'www.netflix.com - test private issue accepted'}

        self.issue_info4 = {
            'action': 'opened',
            'state': 'open',
            'milestoned_with': '',
            'milestone': '',
            'body': '<!-- @browser: Firefox 55.0 -->\n'
            '<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) '
            'Gecko/20100101 Firefox/55.0 -->\n'
            '<!-- @reported_with: web -->\n'
            '<!-- @public_url: '
            'https://github.com/webcompat/webcompat-tests/issues/1  -->\n'
            '\n'
            '**URL**: https://www.netflix.com/',
            'domain': 'www.netflix.com',
            'number': 600,
            'original_labels': ['action-needsmoderation'],
            'public_url':
                'https://github.com/webcompat/webcompat-tests/issues/1',
            'repository_url':
                'https://api.github.com/repos/webcompat/webcompat-tests-private',  # noqa
            'title': 'www.netflix.com - test valid event'}

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
                    'browser': 'Firefox 55.0',
                    'public_url': 'https://foo.example.org/issues/1'}
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
            ({'browser': 'Firefox iOS 33.1'}, 'browser-firefox-ios'),
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
            (self.issue_body8, ['browser-firefox-ios', 'os-ios']),
            (self.issue_body9, ['browser-firefox-ios', 'os-ios']),
            (self.issue_body10, ['browser-firefox-ios', 'device-tablet',
                                 'os-ios']),
            (self.issue_body11, ['browser-firefox-ios', 'device-tablet',
                                 'os-ios']),
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

    def test_prepare_rejected_issue(self):
        """Test we prepare the right payload for the rejected issue."""
        expected = {'body': "<p>The content of this issue doesn't meet our\n"
                    '<a href="https://webcompat.com/terms#acceptable-use">acceptable use</a>\n'  # noqa
                    'guidelines. Its original content has been deleted.</p>',
                    'labels': ['status-notacceptable'],
                    'milestone': 8,
                    'state': 'closed',
                    'title': 'Issue rejected.'}
        actual = helpers.prepare_rejected_issue()
        self.assertEqual(type(actual), dict)
        self.assertEqual(actual, expected)

    def test_prepare_rejected_issue_autoclosed(self):
        """Test payload for the rejected issue that we want to auto close."""
        expected = {
            'body': '<p>Thanks for the report. We have closed this issue\n'
                    'automatically as we suspect it is invalid. If we made '
                    'a mistake, please\nfile a new issue and try to provide '
                    'more context.</p>',
                    'labels': ['bugbug-probability-high'],
                    'milestone': 8,
                    'state': 'closed',
                    'title': 'Issue closed.'}
        actual = helpers.prepare_rejected_issue("autoclosed")
        self.assertEqual(type(actual), dict)
        self.assertEqual(actual, expected)

    @patch('webcompat.webhooks.ml.make_classification_request')
    def test_get_issue_classification(self, mock_class):
        """Make only one request if it returns 200 status code right away.

        If make_classification_request function returns 200 status code,
        make sure that get_issue_classification is not calling it again.
        """
        mock_class.return_value.status_code = 200
        ml.get_issue_classification(12345)
        mock_class.assert_called_once()

    @patch('time.sleep', return_value=None)
    @patch('webcompat.webhooks.ml.make_classification_request')
    def test_get_issue_classification_exception(self, mock_class, mock_time):
        """Poll bugbug and raise an exception if request limit exceeded

        If make_classification_request function returns 202 status code,
        call get_issue_classification again until exception occurs.
        """
        mock_class.return_value.status_code = 202
        with pytest.raises(ConnectionError):
            ml.get_issue_classification(12345)

        assert mock_class.call_count == 4

    def test_prepare_private_url(self):
        """Test private issue url is in the right format."""
        expected = '\n<!-- @private_url: https://github.com/webcompat/webcompat-tests-private/issues/600 -->\n'     # noqa
        actual = helpers.prepare_private_url(
            'https://github.com/webcompat/webcompat-tests-private/issues/600'
        )
        self.assertEqual(actual, expected)


if __name__ == '__main__':
    unittest.main()
