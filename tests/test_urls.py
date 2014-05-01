#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


from unittest import TestCase
import webcompat

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0')}


class TestURLs(TestCase):
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

    def test_thanks(self):
        '''Test that /thanks/1 exists'''
        rv = self.app.get('/thanks/1')
        self.assertEqual(rv.status_code, 200)

    def test_login(self):
        '''Test that the /login route 302s to GitHub'''
        rv = self.app.get('/login')
        self.assertEqual(rv.status_code, 302)
        self.assertIn('github.com/login/oauth/', rv.headers['Location'])

    def test_issue_redirect(self):
        '''Test that the /issues/<number> route 307s to GitHub issues
         (for now)'''
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 307)
        self.assertRegexpMatches(rv.headers['Location'],
                                 r'https.+github.+issues')

    def test_issues_redirect(self):
        '''Test that the /issues route 307s to /index (for now)'''
        rv = self.app.get('/issues')
        self.assertEqual(rv.status_code, 307)
        self.assertIn('localhost', rv.headers['Location'])


if __name__ == '__main__':
    unittest.main()
