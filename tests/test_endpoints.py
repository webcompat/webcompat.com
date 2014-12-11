#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for our API endpoints.'''

import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat

JSON_MIME = 'application/json'


class TestURLs(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_issues_paginate_link_validation_fail(self):
        '''Test we're correctly validating the passed in link.'''
        rv = self.app.get('/api/issues/paginate?link=http://hacks.biz',
                          content_type=JSON_MIME)
        self.assertEqual(rv.status_code, 403)

    def test_issues_paginate_link_validation_pass(self):
        '''Test we're correctly validating the passed in link.'''
        rv = self.app.get(
            ('/api/issues/paginate?link='
             'https://api.github.com/repositories/17839063/issues'),
            content_type=JSON_MIME)
        self.assertEqual(rv.status_code, 200)

if __name__ == '__main__':
    unittest.main()
