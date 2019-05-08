#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for the changelog generator."""

import unittest

from tools import changelog


class TestChangelog(unittest.TestCase):
    """Test for Changelog formatter."""

    def setUp(self):
        """Set up the tests."""
        pass

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_create_changelog(self):
        """Final changelog formatting."""
        changes = [
            {'title': 'Fixes #1 - Everything you can imagine is real.',
             'number': 2,
             'html_url': 'https://github.com/webcompat/webcompat.com/pull/2'},  # noqa
        ]
        expected = '* Fixes #1 - Everything you can imagine is real. [Pull #2](https://github.com/webcompat/webcompat.com/pull/2)\n'  # noqa
        actual = changelog.create_changelog(changes)
        self.assertEqual(actual, expected)

    def test_normalize_title(self):
        """Normalize the title."""
        # Issue instead of Fixes
        actual = changelog.normalize_title(
            'Issue #101 - Everything you can imagine is real.')
        expected = 'Fixes #101 - Everything you can imagine is real.'
        self.assertEqual(actual, expected)
        # Trailing dot
        actual = changelog.normalize_title(
            'Fixes #101. Everything you can imagine is real.')
        expected = 'Fixes #101 - Everything you can imagine is real.'
        self.assertEqual(actual, expected)
        # Space lacking after the number
        actual = changelog.normalize_title(
            'Fixes #101- Everything you can imagine is real.')
        expected = 'Fixes #101 - Everything you can imagine is real.'
        self.assertEqual(actual, expected)
        # Wrong separator.
        actual = changelog.normalize_title(
            'Fixes #101 — Everything you can imagine is real.')
        expected = 'Fixes #101 - Everything you can imagine is real.'
        self.assertEqual(actual, expected)
        # GreenKeeper title style
        actual = changelog.normalize_title('Greenkeeper style 🚀')
        expected = 'NPM update - Greenkeeper style.'
        self.assertEqual(actual, expected)


if __name__ == '__main__':
    unittest.main()
