#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our webhooks."""

import json
import os
import unittest
from unittest.mock import ANY
from unittest.mock import patch

import flask

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
        expected = self.issue_info1
        actual = helpers.get_issue_info(payload)
        self.assertDictEqual(expected, actual)

    def test_get_milestoned_issue_info(self):
        """Extract the right information for a milestoned issue."""
        json_event, signature = event_data('private_milestone_accepted.json')
        payload = json.loads(json_event)
        expected = self.issue_info2
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

    def test_tag_new_public_issue(self):
        """Test the core actions on new opened issues for WebHooks."""
        # A 200 response
        json_event, signature = event_data('new_event_valid.json')
        payload = json.loads(json_event)
        issue_info = helpers.get_issue_info(payload)
        with patch('webcompat.webhooks.helpers.make_request') as proxy:
            proxy.return_value.status_code = 200
            response = helpers.tag_new_public_issue(issue_info)
            self.assertEqual(response.status_code, 200)
            # A 401 response
            proxy.return_value.status_code = 401
            proxy.return_value.content = '{"message":"Bad credentials","documentation_url":"https://developer.github.com/v3"}'  # noqa
            with patch.dict('webcompat.webhooks.helpers.app.config',
                            {'OAUTH_TOKEN': ''}):
                response = helpers.tag_new_public_issue(issue_info)
                self.assertEqual(response.status_code, 401)
                self.assertTrue('Bad credentials' in response.content)

    @patch('webcompat.webhooks.helpers.tag_new_public_issue')
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

    @patch('webcompat.webhooks.helpers.private_issue_moderation')
    def test_patch_acceptable_issue(self, mock_proxy):
        """Test for acceptable issues comes from private repo.

        payload: 'Moderated issue accepted'
        status: 200
        content-type: text/plain
        """
        json_event, signature = event_data('private_milestone_accepted.json')
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
            self.assertEqual(rv.data, b'Moderated issue accepted')
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'text/plain')

    @patch('webcompat.webhooks.helpers.private_issue_moderation')
    def test_patch_acceptable_issue_problem(self, mock_proxy):
        """Test for accepted issues failed.

        payload: 'ooops'
        status: 400
        content-type: text/plain
        """
        json_event, signature = event_data('private_milestone_accepted.json')
        headers = {
            'X-GitHub-Event': 'issues',
            'X-Hub-Signature': signature,
        }
        with webcompat.app.test_client() as c:
            mock_proxy.return_value.status_code = 400
            rv = c.post(
                '/webhooks/labeler',
                data=json_event,
                headers=headers
            )
            self.assertEqual(rv.data, b'ooops')
            self.assertEqual(rv.status_code, 400)
            self.assertEqual(rv.content_type, 'text/plain')

    @patch('webcompat.webhooks.helpers.private_issue_rejected')
    def test_patch_not_acceptable_issue(self, mock_proxy):
        """Test for rejected issues from private repo.

        payload: 'Moderated issue rejected'
        status: 200
        content-type: text/plain

        A rejected issue is a private issue which has been closed.
        """
        json_event, signature = event_data('private_milestone_closed.json')
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
            self.assertEqual(rv.data, b'Moderated issue rejected')
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'text/plain')

    @patch('webcompat.webhooks.helpers.private_issue_rejected')
    def test_patch_acceptable_issue_closed(self, mock_proxy):
        """Test for accepted issues being closed.

        payload: 'Not an interesting hook'
        status: 403
        content-type: text/plain

        An accepted issue, which is being closed, should
        not modify the public issue.
        """
        json_event, signature = event_data(
            'private_milestone_accepted_closed.json')
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
            self.assertEqual(rv.data, b'Not an interesting hook')
            self.assertEqual(rv.status_code, 403)
            self.assertEqual(rv.content_type, 'text/plain')

    @patch('webcompat.webhooks.helpers.private_issue_moderation')
    def test_patch_wrong_repo_for_moderation(self, mock_proxy):
        """Test for issues in the wrong repo.

        payload: 'Wrong repository'
        status: 403
        content-type: text/plain
        """
        json_event, signature = event_data(
            'private_milestone_accepted_wrong_repo.json')
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

    @patch('webcompat.webhooks.helpers.extract_priority_label')
    def test_prepare_accepted_issue(self, mock_priority):
        """Test the payload preparation for accepted moderated issues.

        Labels extraction will create a call to the topsites db
        and return a value. If the db has not been populated, the result
        will be different. So we return a value 'priority-critical' here.
        """
        mock_priority.return_value = 'priority-critical'
        actual = helpers.prepare_accepted_issue(self.issue_info2)
        expected = {
            'body': '<!-- @browser: Firefox 55.0 -->\n'
            '<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) '
            'Gecko/20100101 Firefox/55.0 -->\n'
            '<!-- @reported_with: web -->\n'
            '<!-- @public_url: '
            'https://github.com/webcompat/webcompat-tests/issues/1  -->\n'
            '\n'
            '**URL**: https://www.netflix.com/',
            'labels': ['browser-firefox', 'priority-critical', 'engine-gecko'],
            'title': 'www.netflix.com - test private issue accepted'}
        self.assertEqual(expected, actual)

    @patch('webcompat.webhooks.helpers.private_issue_moderation')
    def test_private_issue_moderated_ok(self, mock_proxy):
        """Test for private issue successfully moderated.

        it returns a 200 code.
        """
        json_event, signature = event_data('private_milestone_accepted.json')
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
            self.assertEqual(rv.data, b'Moderated issue accepted')
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'text/plain')

    @patch('webcompat.webhooks.helpers.make_request')
    def test_arguments_private_issue_moderation(self, mock_proxy):
        """Test accepted issue request with the right arguments."""
        with webcompat.app.test_client() as c:
            mock_proxy.return_value.status_code = 200
            rv = helpers.private_issue_moderation(self.issue_info2)
            method, url_path, data = mock_proxy.call_args[0]
            assert url_path == 'repos/webcompat/webcompat-tests/issues/1'
            assert method == 'patch'
            assert data == ANY
            assert 'www.netflix.com - test private issue accepted' in data['title']  # noqa

    def test_get_public_issue_number(self):
        """Test the extraction of the issue number from the public_url."""
        public_url = 'https://github.com/webcompat/webcompat-tests/issues/1'
        self.assertEqual(helpers.get_public_issue_number(public_url), '1')

    @patch('webcompat.webhooks.helpers.make_request')
    def test_arguments_private_issue_rejected(self, mock_proxy):
        """Test rejected issue request with the right arguments."""
        with webcompat.app.test_client() as c:
            mock_proxy.return_value.status_code = 200
            rv = helpers.private_issue_rejected(self.issue_info3)
            method, url_path, data = mock_proxy.call_args[0]
            issue_number = url_path.replace(
                'repos/webcompat/webcompat-tests/issues/', '')
            # testing that the path is having a number
            self.assertNotEqual(issue_number, '')
            # testing the path starts with the right string
            self.assertTrue(
                url_path.startswith('repos/webcompat/webcompat-tests/issues/'))
            self.assertEqual('Issue rejected.', data['title'])
            self.assertIn('Its original content has been deleted',
                          data['body'])
            self.assertEqual(['status-notacceptable'], data['labels'])
            self.assertEqual('closed', data['state'])
            self.assertIn('milestone', data)
            assert url_path == 'repos/webcompat/webcompat-tests/issues/1'
            assert method == 'patch'
            assert data == ANY

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

    @patch('webcompat.webhooks.helpers.make_request')
    def test_comment_public_uri(self, mock_proxy):
        """Test we post the right comment with public uri."""
        dest = 'repos/webcompat/webcompat-tests-private/issues/600/comments'
        expected_payload = '{"body": "[Original issue 1](https://github.com/webcompat/webcompat-tests/issues/1)"}'  # noqa
        with webcompat.app.test_client() as c:
            mock_proxy.return_value.status_code = 200
            rv = helpers.comment_public_uri(self.issue_info4)
            method, path, payload = mock_proxy.call_args[0]
            assert method == 'post'
            assert path == dest
            assert payload == expected_payload

    @patch('webcompat.webhooks.helpers.comment_public_uri')
    def test_comment_public_uri_for_webhooks(self, mock_proxy):
        """Test we are getting the right message on public uri comment

        payload: 'public url added'
        status: 200
        content-type: text/plain
        """
        json_event, signature = event_data('private_issue_opened.json')
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
            assert rv.data == b'public url added'
            assert rv.status_code == 200
            assert rv.content_type == 'text/plain'

    @patch('webcompat.webhooks.helpers.comment_public_uri')
    def test_comment_public_uri_for_webhooks_fail(self, mock_proxy):
        """Test public uri comment which fails
        let's say the source url is missing.

        payload: 'ooops'
        status: 400
        content-type: text/plain
        """
        json_event, signature = event_data('private_issue_no_source.json')
        headers = {
            'X-GitHub-Event': 'issues',
            'X-Hub-Signature': signature,
        }
        with webcompat.app.test_client() as c:
            mock_proxy.return_value.status_code = 400
            rv = c.post(
                '/webhooks/labeler',
                data=json_event,
                headers=headers
            )
            assert rv.data == b'ooops'
            assert rv.status_code == 400
            assert rv.content_type == 'text/plain'


if __name__ == '__main__':
    unittest.main()
