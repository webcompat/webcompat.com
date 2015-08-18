#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for our API URL endpoints.'''

import json
import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat


# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0'),
           'HTTP_ACCEPT': 'application/json'}


class TestAPIURLs(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_api_issues_search(self):
        '''API issue search with bad keywords returns JSON 404.'''
        rv = self.app.get('/api/issues/search/foobar', environ_base=headers)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')

    def test_api_issues_out_of_range(self):
        '''API issue for a non existent number returns JSON 404.'''
        # If we reach 1,000,000 webcompat issues we can celebrate
        rv = self.app.get('/api/issues/1000000', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)

    def test_api_wrong_route(self):
        '''API with wrong route returns JSON 404.'''
        rv = self.app.get('/api/foobar', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)

    def test_api_wrong_category(self):
        '''API with wrong category returns JSON 404.'''
        rv = self.app.get('/api/issues/category/foobar', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)

if __name__ == '__main__':
    unittest.main()
