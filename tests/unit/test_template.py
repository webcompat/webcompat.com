#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for webcompat/templates/__init__.py."""

import unittest

from webcompat.templates import format_date
from webcompat.templates import format_milestone_class
from webcompat.templates import format_milestone_title
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
        """Test date formatting.

        We trust what GitHub gives us, so just test length.
        input: 2014-05-01T02:26:28Z
        ouput: 2014-05-01
        """
        input = '2014-05-01T02:26:28Z'
        output = format_date(input)
        assert len(output) == 10
        assert 'T' not in output
        assert output == '2014-05-01'

    def test_get_domain(self):
        """Test domain name extraction from title.

        (This really means give us the first pile of strings before
        the first whitespace).
        """
        title = 'staging.webcompat.com - site is not usable'
        assert get_domain(title) == 'staging.webcompat.com'
        title = '😎 😓'
        assert get_domain(title) == '😎'

    def test_get_description(self):
        """Test that we can pull out the first part of the description."""
        body_html_frag = """
<p><strong>Problem type</strong>: Site is not usable<br>
<strong>Description</strong>: Missing items<br>
<strong>Steps to Reproduce</strong>:<br>
"""
        body_html_frag2 = '😎'
        assert get_description(body_html_frag) == 'Missing items'
        assert get_description(body_html_frag2) is None

    def test_format_title(self):
        """Test putting issue titles together."""
        # title comes from body description
        issue_data = {
            'body_html': '\n'
            '<p><strong>Problem type</strong>: Site is not usable<br>\n'
            '<strong>Description</strong>: Desc from Description<br>\n'
            '<strong>Steps to Reproduce</strong>:<br>\n',
            'title': 'staging.webcompat.com - desc from title'}
        expected = 'staging.webcompat.com - Desc from Description'
        assert format_title(issue_data) == expected
        # title comes from issue title
        issue_data = {
            'body_html': 'fix my bug',
            'title': 'staging.webcompat.com - desc from title'}
        expected = 'staging.webcompat.com - desc from title'
        assert format_title(issue_data) == expected

    def test_format_milestone_title(self):
        """Test that we return a properly formatted milestone title."""
        # missing milestone title
        issue_data = {'milestone': {'title': ''}, 'state': 'open'}
        expected = 'Missing Milestone!'
        assert format_milestone_title(issue_data) == expected
        # milestone has title
        issue_data = {'milestone': {'title': 'sitewait'}, 'state': 'open'}
        expected = 'Site Contacted'
        assert format_milestone_title(issue_data) == expected
        # milestone has title in a closed state
        issue_data = {'milestone': {'title': 'sitewait'}, 'state': 'closed'}
        expected = 'Closed: Site Contacted'
        assert format_milestone_title(issue_data) == expected

    def test_format_milestone_class(self):
        """Test that we return the correct class string."""
        # open state
        issue_data = {
            'milestone': {'title': 'needsdiagnosis'},
            'state': 'open'}
        assert format_milestone_class(issue_data) == 'needsdiagnosis'
        # closed state
        issue_data = {
            'milestone': {'title': 'needsdiagnosis'},
            'state': 'closed'}
        assert format_milestone_class(issue_data) == 'closed'
