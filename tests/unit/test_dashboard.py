#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for the Dashboard functions."""

from datetime import datetime
import json
from mock import patch
import os.path
import sys
import unittest


from webcompat.dashboard import browser_labels
from webcompat.dashboard import filter_needstriage
from webcompat.dashboard import has_needsinfo
from webcompat.dashboard import is_older

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat  # noqa

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; '
                               'rv:58.0) Gecko/20100101 Firefox/58.0')}


def json_data(filename):
    """Return a tuple with the content and its signature."""
    current_root = os.path.realpath(os.curdir)
    fixtures_path = 'tests/fixtures/dashboard'
    path = os.path.join(current_root, fixtures_path, filename)
    with open(path, 'r') as f:
        json_event = json.dumps(json.load(f))
    return json_event


class TestDashboard(unittest.TestCase):
    """Test for routes in the the project."""

    def setUp(self):
        """Set up the tests."""
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_filter_needstriage(self):
        """Assess the filtering is correct."""
        expected = [{'needsinfo': True, 'title': 'example.org - dashboard test', 'created_at': '2015-02-01T12:00:00Z', 'updated_at': '2017-11-10T12:00:00Z', 'number': 1, 'older': True, 'browsers': [b'firefox']}, {'needsinfo': False, 'title': 'dashboard.example.com - site is not usable', 'created_at': '2015-02-20T12:00:00Z', 'updated_at': '2015-02-20T12:00:00Z', 'number': 2, 'older': False, 'browsers': [b'chrome', b'firefox']}]  # noqa
        raw_list = json.loads(json_data('triage.json'))
        testdt = datetime(2015, 2, 19, 12, 0, 0)
        with patch('webcompat.dashboard.get_control_date') as control_date:
            control_date.return_value = testdt
            filtered_list, dashboard_stats = filter_needstriage(raw_list)
            self.assertListEqual(expected, filtered_list)
            self.assertEqual(dashboard_stats['total'], 2)
            self.assertEqual(dashboard_stats['older'], 1)
            self.assertEqual(dashboard_stats['needsinfo'], 1)

    def test_has_needsinfo(self):
        """Check if a list of labels contains the 'status-needsinfo'."""
        labels = ['browser-firefox', 'browser-chrome', 'status-needsinfo']
        self.assertTrue(has_needsinfo(labels))
        labels = ['browser-safari', 'status-needsinfo',
                  'browser-firefox-mobile', 'status-needsinfo-karcow',
                  'priority-critical', 'status-needsinfo-and-guacamole']
        self.assertTrue(has_needsinfo(labels))
        labels = ['needsinfo', 'browser-firefox']
        self.assertFalse(has_needsinfo(labels))
        self.assertFalse(has_needsinfo([]))

    def test_is_older(self):
        """Check if an issue is older than a certain time gap."""
        time_gap = datetime(2017, 11, 7, 11, 0, 3, 419569)
        self.assertTrue(is_older('2017-11-05T06:25:36Z', time_gap))
        self.assertFalse(is_older('2017-11-08T00:30:36Z', time_gap))

    def test_browser_labels(self):
        """Check we receive the right list of browsers."""
        labels = ['status-foo', 'blah', 'browser-', 'browser-firefox']
        self.assertListEqual([b'firefox'], browser_labels(labels))


if __name__ == '__main__':
    unittest.main()
