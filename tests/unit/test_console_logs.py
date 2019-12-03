#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for image upload API endpoint.'''

import json
import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))

from webcompat import app  # noqa

LOG = [
    {
        'level': 'log',
        'log': [
            'test log'
        ],
        'uri': 'http://example.com/vendor.js',
        'pos': '95:13'
    },
    {
        'level': 'warn',
        'log': [
            'test warn'
        ],
        'uri': 'http://example.com/test.js',
        'pos': '1:28535'
    }
]


def get_json_contents(filepath):
    with open(filepath, 'r') as f:
        json_contents = json.load(f)
    return json_contents


def get_path(self, url):
    return self.app.config['UPLOADS_DEFAULT_DEST'] + url + '.json'


def cleanup(filepath):
    os.remove(filepath)


class TestConsoleUploads(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app
        self.test_client = self.app.test_client()

    def tearDown(self):
        pass

    def test_get(self):
        '''Test that /console_logs/ doesn't let you GET.'''
        rv = self.test_client.get('/console_logs/')
        self.assertEqual(rv.status_code, 404)

    def test_console_log_upload(self):
        rv = self.test_client.post(
            '/console_logs/', data=json.dumps(LOG))
        self.assertEqual(rv.status_code, 201)

        response = json.loads(rv.data)
        self.assertTrue('url' in response)
        cleanup(get_path(self, response.get('url')))

        rv = self.test_client.post(
            '/console_logs/', data='{test}')
        self.assertEqual(rv.status_code, 400)

        rv = self.test_client.post(
            '/console_logs/', data='')
        self.assertEqual(rv.status_code, 400)

    def test_console_log_file_contents(self):
        rv = self.test_client.post(
            '/console_logs/', data=json.dumps(LOG))
        response = json.loads(rv.data)
        filepath = get_path(self, response.get('url'))
        actual = get_json_contents(filepath)
        self.assertEqual(actual, LOG)
        cleanup(filepath)


if __name__ == '__main__':
    unittest.main()
