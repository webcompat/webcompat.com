#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for issue creation."""


import json
import requests
import unittest
from unittest.mock import patch
from unittest.mock import ANY

from werkzeug.datastructures import MultiDict

from webcompat.issues import report_issue
from webcompat.issues import report_private_issue
from webcompat.issues import report_public_issue
from webcompat.issues import moderation_template


class TestIssue(unittest.TestCase):
    """Tests for issue creation."""

    def setUp(self):
        """Set up the tests."""
        pass

    def tearDown(self):
        """Tear down the tests."""
        pass

    @patch.object(requests, 'post')
    def test_report_issue_returns_number(self, mockpost):
        """Test we can expect an issue number back."""
        mockpost.return_value.status_code = 201
        mockpost.return_value.json.return_value = {'number': 2}
        form = MultiDict([
            ('browser', 'Firefox 99.0'),
            ('description', 'sup'),
            ('details', ''),
            ('os', 'Mac OS X 13'),
            ('problem_category', 'unknown_bug'),
            ('submit_type', 'github-proxy-report'),
            ('url', 'http://3139.example.com'),
            ('username', ''), ])
        rv = report_issue(form, True)
        self.assertEqual(rv.get('number'), 2)

    @patch.object(requests, 'post')
    def test_report_private_issue_returns_nothing(self, mockpost):
        """Test that we get nothing back from a private issue report."""
        mockpost.return_value.json.return_value = {'number': 2}
        form = MultiDict([
            ('browser', 'Firefox 99.0'),
            ('description', 'sup'),
            ('details', ''),
            ('os', 'Mac OS X 13'),
            ('problem_category', 'unknown_bug'),
            ('submit_type', 'github-proxy-report'),
            ('url', 'http://3139.example.com'),
            ('username', ''), ])
        rv = report_private_issue(form, 'http://public.example.com')
        self.assertIsNone(rv)

    @patch.object(requests, 'post')
    def test_report_public_issue_returns_moderation_template(self, mockpost):
        """Test the data in report_public_issue contains the right data."""
        report_public_issue()
        args, kwargs = mockpost.call_args
        post_data = json.loads(kwargs['data'])
        self.assertIs(type(post_data), dict)
        self.assertIn('title', post_data.keys())
        self.assertIn('body', post_data.keys())
        self.assertIn('labels', post_data.keys())
        self.assertEqual(['action-needsmoderation'], post_data['labels'])

    def test_moderation_template(self):
        """Check the moderation template structure.

        - must be a dictionary
        - must contain the keys: title, body
        """
        actual = moderation_template('ongoing')
        self.assertIs(type(actual), dict)
        self.assertIn('title', actual.keys())
        self.assertIn('body', actual.keys())

    def test_moderation_template_rejected(self):
        """Check the return values are for the rejected case."""
        actual = moderation_template('rejected')
        self.assertEqual(actual['title'], 'Issue rejected.')
        self.assertIn('Its original content has been deleted', actual['body'])

    def test_moderation_template_ongoing(self):
        """Check the return values are for the needsmoderation case."""
        # test the default
        actual = moderation_template()
        self.assertEqual(actual['title'], 'In the moderation queue.')
        self.assertIn('put in the moderation queue.', actual['body'])
        # test the keyword
        actual = moderation_template('ongoing')
        self.assertEqual(actual['title'], 'In the moderation queue.')
        self.assertIn('put in the moderation queue.', actual['body'])
        # bad keyword, we go back to the default.
        actual = moderation_template('punkcat')
        self.assertEqual(actual['title'], 'In the moderation queue.')
        self.assertIn('put in the moderation queue.', actual['body'])
