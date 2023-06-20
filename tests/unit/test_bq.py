#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for Siterank class."""

import json
import unittest
import webcompat

from unittest.mock import patch
from webcompat.bq import send_bq_report


class TestBQ(unittest.TestCase):
    """Tests for bq module."""

    def setUp(self):
        """Set up the tests."""
        webcompat.app.config['TESTING'] = True

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_send_bq_report(self):
        with patch('google.cloud.bigquery.Client') as MockClient:
            mock_client_instance = MockClient.return_value
            mock_client_instance.insert_rows_json.return_value = []

            form_object = {
                'url': 'https://example.com/',
                'steps_reproduce': 'site is broken',
                'details': json.dumps({
                    'additionalData': {
                        'applicationName': 'Firefox',
                    },
                    'consoleLog': ['console.log(hi)']
                })
            }

            result = send_bq_report(form_object)
            self.assertEqual(result, 'success')

    def test_send_bq_report_error(self):
        with patch('google.cloud.bigquery.Client') as MockClient:
            mock_client_instance = MockClient.return_value
            mock_client_instance.insert_rows_json.return_value = [
                [{'index': 0,
                  'errors': [{
                      'reason': 'invalid',
                      'location': '',
                      'debugInfo': '',
                      'message': 'Repeated value added outside of an array, field: reported_at.'    # noqa
                    }]
                  }]
            ]

            form_object = {
                'url': 'https://example.com/',
                'steps_reproduce': 'site is broken',
                'details': json.dumps({
                    'additionalData': {
                        'applicationName': 'Firefox',
                    },
                    'consoleLog': ['console.log(hi)']
                })
            }

            result = send_bq_report(form_object)
            self.assertEqual(result, 'error')


if __name__ == '__main__':
    unittest.main()
