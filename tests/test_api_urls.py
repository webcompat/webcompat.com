#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for our API URL endpoints.'''

import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat


# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0')}


class TestAPIURLs(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_api_issues_search(self):
        '''test that the API issue search of unknown keywords'''
        rv = self.app.get('/api/issues/search/foobar', environ_base=headers)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')

if __name__ == '__main__':
    unittest.main()
