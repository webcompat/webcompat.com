#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for Siterank class."""

import unittest
from unittest.mock import patch

from tools.topsites.siterank import SiteRank


class TestSiteRank(unittest.TestCase):
    """Tests for Top Sites Tools."""

    def setUp(self):
        """Set up the tests."""
        self.siterank = SiteRank()

    def test_get_priority(self):
        """Get a priority based on rank and initial priority."""
        self.assertEqual(self.siterank.get_priority(100, 1), 1)
        self.assertEqual(self.siterank.get_priority(1000, 1), 2)
        self.assertEqual(self.siterank.get_priority(9999, 1), 3)
        self.assertEqual(self.siterank.get_priority(100, 2), 2)
        self.assertEqual(self.siterank.get_priority(999, 2), 3)

    @patch('tools.topsites.siterank.site_global_session.add')
    def test_save_global_rank(self, session_mock):
        """Save domain with a global rank."""
        site_row = self.siterank.save_global_rank('example.com', 555)
        self.assertEqual(self.siterank.sites_global, {'example.com': site_row})

    @patch('tools.topsites.siterank.site_global_session.add')
    @patch('tools.topsites.siterank.site_regional_session.add')
    def test_save_regional_rank(self, r_mock, g_mock):
        """Save domain with a regional rank."""
        regional_site_row = self.siterank.save_regional_rank(
            'mysite.com', 49, 'DE'
        )
        self.assertEqual(self.siterank.sites_regional, {
            'mysite.com': regional_site_row
        })

    @patch('tools.topsites.siterank.site_global_session.add')
    @patch('tools.topsites.siterank.site_regional_session.add')
    def test_save_regional_rank_same(self, r_mock, g_mock):
        """Regional rank is not saved because its priority is the same in global."""   # noqa
        global_site_row = self.siterank.save_global_rank('example.com', 555)
        self.siterank.save_regional_rank('example.com', 48, 'GB')

        self.assertEqual(self.siterank.sites_global, {
            'example.com': global_site_row
        })
        self.assertEqual(self.siterank.sites_regional, {})

    @patch('tools.topsites.siterank.site_global_session.add')
    @patch('tools.topsites.siterank.site_regional_session.add')
    def test_save_regional_rank_lower(self, r_mock, g_mock):
        """Regional rank is saved because priority is lower than in global."""
        global_site_row = self.siterank.save_global_rank('example.com', 1001)
        regional_site_row = self.siterank.save_regional_rank(
            'example.com', 48, 'GB'
        )
        self.assertEqual(self.siterank.sites_global, {
            'example.com': global_site_row
        })
        self.assertEqual(self.siterank.sites_regional, {
            'example.com': regional_site_row
        })

    @patch('tools.topsites.siterank.site_global_session.add')
    @patch('tools.topsites.siterank.site_regional_session.add')
    def test_save_regional_rank_multiple(self, r_mock, g_mock):
        """If a site is popular in two countries, higher priority one will be saved."""  # noqa
        self.siterank.save_regional_rank('example.com', 101, 'GB')
        regional_site_row_2 = self.siterank.save_regional_rank(
            'example.com', 49, 'DE'
        )
        self.assertEqual(self.siterank.sites_regional, {
            'example.com': regional_site_row_2,
        })

    @patch('tools.topsites.siterank.site_global_session.add')
    @patch('tools.topsites.siterank.site_regional_session.add')
    def test_save_global_regional_rank_multiple(self, r_mock, g_mock):
        """If a site is popular globally and in multiple countries, higher priority one will be saved."""  # noqa
        global_site_row = self.siterank.save_global_rank('example.com', 12)
        self.siterank.save_regional_rank('example.com', 101, 'GB')
        self.siterank.save_regional_rank('example.com', 49, 'DE')

        self.assertEqual(self.siterank.sites_global, {
            'example.com': global_site_row
        })
        self.assertEqual(self.siterank.sites_regional, {})


if __name__ == '__main__':
    unittest.main()
