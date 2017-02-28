#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for HTTP Caching on webcompat resources.'''

import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat  # nopep8

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
html_headers = {
    'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; '
                        'rv:53.0) Gecko/20100101 Firefox/53.0'),
    'HTTP_ACCEPT': 'text/html'}


class TestHTTPCaching(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_issue_has_etag(self):
        '''Check ETAG for issues.'''
        rv = self.app.get('/issues/100', environ_base=html_headers)
        response_headers = rv.headers
        self.assertIn('etag', response_headers)
        self.assertIsNotNone(response_headers['etag'])

    def test_cache_control(self):
        '''Check Cache-Control for issues.'''
        rv = self.app.get('/issues/100', environ_base=html_headers)
        response_headers = rv.headers
        self.assertIn('cache-control', response_headers)
        self.assertEqual(response_headers['cache-control'],
                         'private, max-age=86400')

    def test_not_modified_status(self):
        '''Checks if we receive a 304 Not Modified.'''
        for uri in ['/about',
                    '/contributors',
                    '/issues',
                    '/issues/100',
                    '/privacy']:
            rv = self.app.get(uri, environ_base=html_headers)
            response_headers = rv.headers
            etag = response_headers['etag']
            rv2 = self.app.get(uri,
                               environ_base=html_headers,
                               headers={'If-None-Match': etag})
            self.assertEqual(rv2.status_code, 304)
            self.assertEqual(rv2.data, '')
            self.assertIn('cache-control', response_headers)
            self.assertEqual(response_headers['cache-control'],
                             'private, max-age=86400')


if __name__ == '__main__':
    unittest.main()
