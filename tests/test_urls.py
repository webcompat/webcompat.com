#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for our URL endpoints.'''

import unittest
import os.path
import sys

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0')}


class TestURLs(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_home(self):
        '''Test that the home page exists'''
        rv = self.app.get('/', environ_base=headers)
        self.assertEqual(rv.status_code, 200)

    def test_about(self):
        '''Test that /about exists'''
        rv = self.app.get('/about')
        self.assertEqual(rv.status_code, 200)

    def test_privacy(self):
        '''Test that /privacy exists'''
        rv = self.app.get('/privacy')
        self.assertEqual(rv.status_code, 200)


    def test_thanks(self):
        '''Test that /thanks/1 exists'''
        rv = self.app.get('/thanks/1')
        self.assertEqual(rv.status_code, 200)

    def test_login(self):
        '''Test that the /login route 302s to GitHub'''
        rv = self.app.get('/login')
        self.assertEqual(rv.status_code, 302)
        self.assertIn('github.com/login/oauth/', rv.headers['Location'])

    def test_issue_int(self):
        '''Test that an issue only displays if <number> is an integer.'''
        '''Test that the /issues/<number> exists, and does not redirect.'''
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 404)
        rv = self.app.get('/issues/three')
        self.assertEqual(rv.status_code, 404)
        self.assertNotEqual(rv.status_code, 200)

    def test_issue_redirect(self):
        '''Test that the /issues/<number> exists, and does not redirect.'''
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 307)

    def test_issues_redirect(self):
        '''Test that the /issues route 307s to /index (for now)'''
        rv = self.app.get('/issues')
        self.assertEqual(rv.status_code, 307)
        self.assertIn('localhost', rv.headers['Location'])

    def test_api_endpoint(self):
        '''Test that GET of /api/foo returns a 406.'''
        rv = self.app.get('/api/issues/22')
        self.assertEqual(rv.status_code, 406)


if __name__ == '__main__':
    unittest.main()
