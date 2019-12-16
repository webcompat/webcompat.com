#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for console logs upload.'''

import json
import os.path
import sys
import unittest
from werkzeug.datastructures import MultiDict

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


def form_request(data):
    d = MultiDict()
    d['console_logs'] = data
    return d


class TestConsoleUploads(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app
        self.test_client = self.app.test_client()

    def tearDown(self):
        pass

    def test_get(self):
        '''Test that /upload/ doesn't let you GET.'''
        rv = self.test_client.get('/upload/')
        self.assertEqual(rv.status_code, 404)

    def test_console_log_upload(self):
        rv = self.test_client.post(
            '/upload/', data=form_request(json.dumps(LOG)))
        self.assertEqual(rv.status_code, 201)

        response = json.loads(rv.data)
        self.assertTrue('url' in response)
        cleanup(get_path(self, response.get('url')))

    def test_console_log_bad_format(self):
        rv = self.test_client.post(
            '/upload/', data=form_request('{test}'))
        self.assertEqual(rv.status_code, 400)

        rv = self.test_client.post(
            '/upload/', data=form_request(''))
        self.assertEqual(rv.status_code, 501)

        rv = self.test_client.post(
            '/upload/', data=json.dumps(LOG))
        self.assertEqual(rv.status_code, 501)

    def test_console_log_file_contents(self):
        rv = self.test_client.post(
            '/upload/', data=form_request(json.dumps(LOG)))
        response = json.loads(rv.data)
        filepath = get_path(self, response.get('url'))
        actual = get_json_contents(filepath)
        self.assertEqual(actual, LOG)
        cleanup(filepath)

    def test_console_log_render(self):
        test = [
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
                    '<script> alert("hi")</script>',
                    'something else..'
                ],
                'uri': 'http://example.com/test.js',
                'pos': '1:28535'
            },
            {
                'level': 'error',
                'log': [
                    '<div style="background-image: url(javascript:alert(\'XSS\'))">',  # noqa
                ],
                'uri': 'http://example.com/test.js',
                'pos': '1:28535'
            }
        ]

        rv = self.test_client.post(
            '/upload/', data=form_request(json.dumps(test)))
        response = json.loads(rv.data)
        console_logs_url = '/console_logs/' + response.get('url')
        rv = self.test_client.get(console_logs_url)
        for expected in [
            b'<div class="log level-log">',
            b'<div class="log level-warn">',
            b'<div class="log level-error">',
            b'<a href="http://example.com/vendor.js">vendor.js:95:13</a>',
            b'test log',
            b'&lt;script&gt; alert(&#34;hi&#34;)&lt;/script&gt;',
            b'&lt;div style=&#34;background-image: url(javascript:alert(&#39;XSS&#39;))&#34;&gt;'  # noqa
        ]:
            self.assertTrue(expected in rv.data)

        self.assertEqual(rv.status_code, 200)
        filepath = get_path(self, response.get('url'))
        cleanup(filepath)


if __name__ == '__main__':
    unittest.main()
