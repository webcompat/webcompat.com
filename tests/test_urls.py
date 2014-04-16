#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


import unittest
import webcompat

headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                                'rv:31.0) Gecko/20100101 Firefox/31.0')}


class TestURLs:
    def setup(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def teardown(self):
        pass

    def test_home(self):
        '''Test that the home page exists'''
        rv = self.app.get('/', environ_base=headers)
        assert rv.status_code == 200

    def test_about(self):
        '''Test that /about exists'''
        rv = self.app.get('/about')
        assert rv.status_code == 200

    def test_thanks(self):
        '''Test that /thanks exists'''
        rv = self.app.get('/thanks')
        assert rv.status_code == 200

    def test_login(self):
        '''Test that the login route 302s to GitHub'''
        rv = self.app.get('/login')
        assert rv.status_code == 302
        assert 'github.com/login/oauth/' in rv.headers['Location']

    def test_issue_redirect(self):
        '''Test that the login route 307s to GitHub issues (for now)'''
        rv = self.app.get('/issues/3')
        assert rv.status_code == 307
        assert 'nobody-look-at-this/issues/' in rv.headers['Location']

    def test_issues_redirect(self):
        '''Test that the login route 307s to /index (for now)'''
        rv = self.app.get('/issues')
        assert rv.status_code == 307
        assert 'localhost' in rv.headers['Location']


if __name__ == '__main__':
    unittest.main()
