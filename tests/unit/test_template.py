#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for webcompat/templates/__init__.py."""

import unittest

from webcompat.templates import format_date
from webcompat.templates import format_title
from webcompat.templates import get_description
from webcompat.templates import get_domain


class TestTemplates(unittest.TestCase):
    """Class for testing template filters and helpers."""

    def setUp(self):
        """Set up."""
        pass

    def tearDown(self):
        """Tear down."""
        pass

    def test_format_date(self):
        """We trust what GitHub gives us, so just test length."""
        input = '2014-05-01T02:26:28Z'
        output = format_date(input)
        self.assertEqual(len(output), 10)
        self.assertNotRegex(output, r'T')

    def test_get_domain(self):
        """Test domain name extraction from title.

        (This really means give us the first pile of strings before
        the first whitespace).
        """
        title = 'staging.webcompat.com - site is not usable'
        self.assertEqual(get_domain(title), 'staging.webcompat.com')
        title = '😎 😓'
        self.assertEqual(get_domain(title), '😎')

    def test_get_description(self):
        """Test that we can pull out the first part of the description."""
        body_html_frag = """
<p><strong>Problem type</strong>: Site is not usable<br>
<strong>Description</strong>: Missing items<br>
<strong>Steps to Reproduce</strong>:<br>
"""
        body_html_frag2 = '😎'
        self.assertEqual(get_description(body_html_frag), 'Missing items')
        self.assertEqual(get_description(body_html_frag2), None)

    def test_format_title(self):
        """Test putting issue titles together."""
        issue_data = {}
        issue_data['title'] = 'staging.webcompat.com - desc from title'
        issue_data['body_html'] = """
<p><strong>Problem type</strong>: Site is not usable<br>
<strong>Description</strong>: Desc from Description<br>
<strong>Steps to Reproduce</strong>:<br>
"""
        formatted_title = format_title(issue_data)
        self.assertEqual(formatted_title,
                         'staging.webcompat.com - Desc from Description')
        issue_data['body_html'] = 'fix my bug'
        formatted_title = format_title(issue_data)
        self.assertEqual(formatted_title,
                         'staging.webcompat.com - desc from title')
