#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for helper methods in webcompat/helpers.py.'''

import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))

import webcompat
from webcompat.helpers import format_link_header
from webcompat.helpers import normalize_api_params
from webcompat.helpers import parse_link_header
from webcompat.helpers import rewrite_and_sanitize_link
from webcompat.helpers import rewrite_links
from webcompat.helpers import sanitize_link
from webcompat.helpers import get_browser_name
from webcompat.helpers import get_browser


ACCESS_TOKEN_LINK = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3&access_token=12345>; rel="next", <https://api.github.com/repositories/17839063/issues?access_token=12345&per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&access_token=12345&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1&access_token=12345>; rel="prev"'  # nopep8
GITHUB_ISSUES_LINK_HEADER = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3>; rel="next", <https://api.github.com/repositories/17839063/issues?per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="prev"'  # nopep8
GITHUB_SEARCH_LINK_HEADER = '<https://api.github.com/search/issues?q=taco&page=2>; rel="next", <https://api.github.com/search/issues?q=taco&page=26>; rel="last"'  # nopep8
REWRITTEN_ISSUES_LINK_HEADER = '</api/issues?per_page=50&page=3>; rel="next", </api/issues?per_page=50&page=4>; rel="last", </api/issues?per_page=50&page=1>; rel="first", </api/issues?per_page=50&page=1>; rel="prev"'  # nopep8
REWRITTEN_SEARCH_LINK_HEADER = '</api/issues/search?q=taco&page=2>; rel="next", </api/issues/search?q=taco&page=26>; rel="last"'  # nopep8
PARSED_LINKED_HEADERS = [{'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=3', 'rel': 'next'}, {'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=4', 'rel': 'last'}, {'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=1', 'rel': 'first'}, {'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=1', 'rel': 'prev'}]  # nopep8
NON_TABLET_UA = "Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0"  # nopep8
TABLET_UA = "Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0"  # nopep8
PARSED_NON_TABLET_BROWSER_NAME = "firefox mobile"
PARSED_TABLET_BROWSER_NAME = "firefox mobile tablet"
PARSED_NON_TABLET_BROWSER = "Firefox Mobile 40.0 "
PARSED_TABLET_BROWSER = "Firefox Mobile 41.0 (Tablet)"


class TestHelpers(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_rewrite_link(self):
        '''Test we're correctly rewriting the passed in link.'''
        self.assertEqual(rewrite_links(GITHUB_ISSUES_LINK_HEADER),
                         REWRITTEN_ISSUES_LINK_HEADER)
        self.assertEqual(rewrite_links(GITHUB_SEARCH_LINK_HEADER),
                         REWRITTEN_SEARCH_LINK_HEADER)

    def test_sanitize_link(self):
        '''Test that we're removing access_token parameters.'''
        self.assertNotIn('access_token=', sanitize_link(ACCESS_TOKEN_LINK))

    def test_rewrite_and_sanitize_link(self):
        self.assertNotIn('access_token=',
                         rewrite_and_sanitize_link(ACCESS_TOKEN_LINK))
        self.assertEqual(rewrite_and_sanitize_link(ACCESS_TOKEN_LINK),
                         REWRITTEN_ISSUES_LINK_HEADER)

    def test_normalize_api_params_converts_correctly(self):
        '''Test that API params are correctly converted to Search API.'''
        self.assertEqual(normalize_api_params({'direction': u'desc'}),
                         {'order': u'desc'})
        self.assertNotIn('direction',
                         normalize_api_params({'direction': u'desc'}))

        self.assertEqual(normalize_api_params({'state': u'closed', 'q': 'hi'}),
                         {'q': u'hi state:closed'})
        self.assertNotIn('state',
                         normalize_api_params({'state': u'closed', 'q': 'hi'}))

        self.assertEqual(normalize_api_params({'mentioned': u'coolguy',
                                              'q': 'hi'}),
                         {'q': u'hi mentions:coolguy'})
        self.assertNotIn('mentioned',
                         normalize_api_params({'mentioned': u'coolguy',
                                              'q': 'hi'}))

        self.assertEqual(normalize_api_params({'creator': u'coolguy',
                                              'q': 'hi'}),
                         {'q': u'hi author:coolguy'})
        self.assertNotIn('creator',
                         normalize_api_params({'creator': u'coolguy',
                                              'q': 'hi'}))

        multi_before = {'direction': u'desc', 'state': u'closed',
                        'mentioned': u'coolguy', 'creator': u'coolguy',
                        'per_page': u'1', 'q': u'hi'}
        multi_after = {'order': u'desc',
                       'q': u'hi state:closed author:coolguy mentions:coolguy',
                       'per_page': u'1'}
        self.assertEqual(normalize_api_params(multi_before), multi_after)

    def test_normalize_api_params_ignores_unknown_params(self):
        '''normalize_api_params shouldn't transform unknown params.'''
        self.assertEqual({'foo': u'bar'},
                         normalize_api_params({'foo': u'bar'}))
        self.assertEqual({'order': u'desc', 'foo': u'bar'},
                         normalize_api_params({'foo': u'bar',
                                              'direction': u'desc'}))

    def test_parse_http_link_headers(self):
        '''Test HTTP Links parsing for GitHub only.'''
        link_header = GITHUB_ISSUES_LINK_HEADER
        parsed_headers = PARSED_LINKED_HEADERS
        self.assertEqual(parse_link_header(link_header), parsed_headers)

    def test_format_http_link_headers(self):
        '''Test HTTP Links formating.'''
        parsed_headers = PARSED_LINKED_HEADERS
        link_header = GITHUB_ISSUES_LINK_HEADER
        self.assertEqual(format_link_header(parsed_headers), link_header)

    def test_get_browser_name_Tablet(self):
        '''Test Browser name parsing for tablet devices.'''
        user_agent = TABLET_UA
        parsed_browser_name = PARSED_TABLET_BROWSER_NAME
        self.assertEqual(get_browser_name(user_agent), parsed_browser_name)

    def test_get_browser_name_Non_Tablet(self):
        '''Test Browser name parsing for non-tablet devices.'''
        user_agent = NON_TABLET_UA
        parsed_browser_name = PARSED_NON_TABLET_BROWSER_NAME
        self.assertEqual(get_browser_name(user_agent), parsed_browser_name)

    def test_get_browser_Tablet(self):
        '''Test Browser parsing for tablet devices.'''
        user_agent = TABLET_UA
        parsed_browser = PARSED_TABLET_BROWSER
        self.assertEqual(get_browser(user_agent), parsed_browser)

    def test_get_browser_Non_Tablet(self):
        '''Test Browser parsing for non-tablet devices.'''
        user_agent = NON_TABLET_UA
        parsed_browser = PARSED_NON_TABLET_BROWSER
        self.assertEqual(get_browser(user_agent), parsed_browser)

if __name__ == '__main__':
    unittest.main()
