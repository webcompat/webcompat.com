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
        # Switch to False here because we don't want to send the mocked
        # Fixture data. Which is OK because these don't touch GitHub API data.
        webcompat.app.config['TESTING'] = False
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

    def test_api_labels_without_auth(self):
        '''API access to labels without auth returns JSON 200.'''
        rv = self.app.get('/api/issues/labels', environ_base=headers)
        self.assertEqual(rv.status_code, 200)
        self.assertEqual(rv.content_type, 'application/json')

    def test_api_comments_link_header_auth(self):
        '''API access to comments greater than 30 returns pagination in Link
        header of the response.'''
        query_string = {'callback': 'foo'}
        # Force a JSONP callback response with `query_string` because it gives
        # us the header properties we want to test.
        rv = self.app.get('/api/issues/398/comments',
                          query_string=query_string, environ_base=headers)
        self.assertTrue = all(x in rv.data for x in ['Link', 'rel', 'next',
                                                     'last', 'page'])
        self.assertEqual(rv.status_code, 200)
        self.assertEqual(rv.content_type, 'application/json')
        # API access to comments for an issue with < 30 does not return link a
        # header in the response (until GitHub changes it....?)
        rv = self.app.get('/api/issues/4/comments', query_string=query_string,
                          environ_base=headers)
        self.assertTrue = not all(x in rv.data for x in ['Link', 'rel', 'next',
                                                         'last', 'page'])
        self.assertEqual(rv.status_code, 200)
        self.assertEqual(rv.content_type, 'application/json')

    def test_api_set_labels_without_auth(self):
        '''API setting labels without auth returns JSON 403 error code.'''
        rv = self.app.post('/api/issues/1/labels',
                           environ_base=headers, data='[]')
        self.assertEqual(rv.status_code, 403)

    def test_api_user_activity_without_auth(self):
        '''API access to user activity without auth returns JSON 401.'''
        rv = self.app.get('/api/issues/miketaylr/creator',
                          environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 401)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 401)

    def test_api_search_wrong_parameter(self):
        '''API with wrong parameter returns JSON 404.'''
        rv = self.app.get('/api/issues/search?z=foobar', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)


if __name__ == '__main__':
    unittest.main()
