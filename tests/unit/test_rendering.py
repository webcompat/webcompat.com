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
import webcompat  # noqa

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3425.0 Safari/537.36'  # noqa
FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/61.0'  # noqa
FIREFOX_AND_UA = 'Mozilla/5.0 (Android; Mobile; rv:61.0) Gecko/61.0 Firefox/61.0'  # noqa
OPERA_UA = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 OPR/15.0.1147.100'  # noqa
headers = {'HTTP_USER_AGENT': FIREFOX_UA}


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
        issue_number = '396'
        default_title = 'Web Compatibility'
        website_uris = [
            ('/', 'Bug reporting for the web'),
            ('/about', 'About'),
            ('/contributors', 'Contributors'),
            ('/issues/' + issue_number, 'Issue #' + issue_number),
            ('/issues', 'Issues'),
            ('issues/new', 'New Issue'),
            ('/privacy', 'Privacy Policy'),
            ('/terms', 'Terms of Service'),
            ('/404', default_title)
        ]
        with webcompat.app.app_context():
            for uri, title in website_uris:
                rv = self.app.get(uri, environ_base=headers)
                expected = '<title>{title} | webcompat.com</title>'.format(
                    title=title)
                self.assertTrue(expected.encode('utf-8') in rv.data)

    def test_user_title_pages(self):
        """Testing user activity page title."""
        title = b"<title>testuser's Activity | webcompat.com</title>"
        with webcompat.app.app_context():
            self.login('testuser', 'foobar')
            rv = self.app.get('/activity/testuser')
            self.assertTrue(title in rv.data)

    def test_addon_link(self):
        """An addon link should be in the top navigation bar.

        This depends on the user agent string.
        """
        # testing Firefox addon
        headers = {'HTTP_USER_AGENT': FIREFOX_UA}
        rv = self.app.get('/', environ_base=headers)
        expected = b'<span class="link-text">Download Firefox Add-on</span>'
        self.assertTrue(expected in rv.data)
        # testing for Firefox Androidpe
        headers = {'HTTP_USER_AGENT': FIREFOX_AND_UA}
        rv = self.app.get('/', environ_base=headers)
        expected = b'<span class="link-text">Download Firefox Add-on</span>'
        self.assertTrue(expected in rv.data)
        # testing for Chrome
        headers = {'HTTP_USER_AGENT': CHROME_UA}
        rv = self.app.get('/', environ_base=headers)
        expected = b'<span class="link-text">Download Chrome Add-on</span>'
        self.assertTrue(expected in rv.data)
        # testing for Opera
        headers = {'HTTP_USER_AGENT': OPERA_UA}
        rv = self.app.get('/', environ_base=headers)
        expected = b'<span class="link-text">Download Opera Add-on</span>'
        self.assertTrue(expected in rv.data)
        # testing for unknown browser
        headers = {'HTTP_USER_AGENT': 'Punk Cat Space'}
        rv = self.app.get('/', environ_base=headers)
        expected = b'<span class="link-text">Give Feedback</span>'
        self.assertTrue(expected in rv.data)

    def test_form_rendering(self):
        """Double Check that the form is properly populated."""
        url = '/issues/new?url=http://example.com/&label=type-stylo'
        headers = {'HTTP_USER_AGENT': FIREFOX_UA}
        rv = self.app.get(url, environ_base=headers)
        self.assertTrue(b'Firefox 61.0' in rv.data)
        self.assertTrue(b'Mac OS X 10.13' in rv.data)
        self.assertTrue(b'http://example.com/' in rv.data)

    def test_wellknown_subpath(self):
        """Test that the /.wellknown/subpath route gets 404."""
        rv = self.app.get('/.well-known/test-route')
        expected = b'test-route'
        self.assertEqual(rv.status_code, 404)
        self.assertTrue(expected in rv.data)

    def test_wellknown_security(self):
        """Test that the /.wellknown/security.txt exists."""
        rv = self.app.get('/.well-known/security.txt')
        expected = b'Contact: mailto:kdubost+securitywebc'
        self.assertEqual(rv.status_code, 200)
        self.assertTrue(expected in rv.data)


if __name__ == '__main__':
    unittest.main()
