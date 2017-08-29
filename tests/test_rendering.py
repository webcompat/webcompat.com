#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our URI endpoints' rendering."""

import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat  # nopep8

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0')}


class TestURIContent(unittest.TestCase):
    """Tests for the content once HTML templates are rendered."""

    def setUp(self):
        """Set up the tests."""
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        """Tear down the tests."""
        pass

    def login(self, username, password):
        """Create a call to the login page to initiate g."""
        return self.app.get('/login', data=dict(
            username=username,
            password=password
        ), follow_redirects=True)

    def test_titles(self):
        """Page title format for different URIs."""
        issueNum = '1000'
        defaultTitle = 'Web Compatibility'
        website_uris = [
            ('/', defaultTitle),
            ('/about', 'About'),
            ('/contributors', 'Contributors'),
            ('/tools/cssfixme', 'CSS Fix Me'),
            ('/issues/' + issueNum, 'Issue #' + issueNum),
            ('/issues', 'Issues'),
            ('issues/new', 'New Issue'),
            ('/privacy', 'Privacy Policy'),
            ('/404', defaultTitle)
        ]
        for uri, title in website_uris:
            rv = self.app.get(uri, environ_base=headers)
            expected = '<title>{title} | webcompat.com</title>'.format(
                title=title)
            self.assertTrue(expected in rv.data)

    def test_user_title_pages(self):
        """Testing user activity page title."""
        title = "<title>testuser's Activity | webcompat.com</title>"
        with webcompat.app.app_context():
            self.login('testuser', 'foobar')
            rv = self.app.get('/activity/testuser')
            self.assertTrue(title in rv.data)

if __name__ == '__main__':
    unittest.main()
