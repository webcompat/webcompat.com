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
from webcompat.helpers import get_browser_name
from webcompat.helpers import get_browser
from webcompat.helpers import get_os
from webcompat.helpers import normalize_api_params
from webcompat.helpers import parse_link_header
from webcompat.helpers import rewrite_and_sanitize_link
from webcompat.helpers import rewrite_links
from webcompat.helpers import sanitize_link


ACCESS_TOKEN_LINK = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3&access_token=12345>; rel="next", <https://api.github.com/repositories/17839063/issues?access_token=12345&per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&access_token=12345&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1&access_token=12345>; rel="prev"'  # nopep8
GITHUB_ISSUES_LINK_HEADER = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3>; rel="next", <https://api.github.com/repositories/17839063/issues?per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="prev"'  # nopep8
REWRITTEN_ISSUES_LINK_HEADER = '</api/issues?per_page=50&page=3>; rel="next", </api/issues?per_page=50&page=4>; rel="last", </api/issues?per_page=50&page=1>; rel="first", </api/issues?per_page=50&page=1>; rel="prev"'  # nopep8
GITHUB_SEARCH_LINK_HEADER = '<https://api.github.com/search/issues?q=taco&page=2>; rel="next", <https://api.github.com/search/issues?q=taco&page=26>; rel="last"'  # nopep8
REWRITTEN_SEARCH_LINK_HEADER = '</api/issues/search?q=taco&page=2>; rel="next", </api/issues/search?q=taco&page=26>; rel="last"'  # nopep8
PARSED_LINKED_HEADERS = [{'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=3', 'rel': 'next'}, {'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=4', 'rel': 'last'}, {'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=1', 'rel': 'first'}, {'link': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=1', 'rel': 'prev'}]  # nopep8
FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0'  # nopep8
FIREFOX_MOBILE_UA_OLD = 'Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0'  # nopep8
FIREFOX_MOBILE_UA = 'Mozilla/5.0 (Android 6.0.1; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0'  # nopep8
FIREFOX_TABLET_UA = 'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0'  # nopep8
SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.39 (KHTML, like Gecko) Version/9.0 Safari/601.1.39'  # nopep8
SAFARI_MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25'  # nopep8
SAFARI_TABLET_UA = 'Mozilla/5.0 (iPad; CPU OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3'  # nopep8
CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2720.0 Safari/537.36'  # nopep8
CHROME_MOBILE_UA = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19'  # nopep8
CHROME_TABLET_UA = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Safari/535.19'  # nopep8


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

    def test_get_browser_name(self):
        '''Test browser name parsing via get_browser_name helper method.'''
        self.assertEqual(get_browser_name(FIREFOX_UA), 'firefox')
        self.assertEqual(get_browser_name(FIREFOX_MOBILE_UA), 'firefox mobile')
        self.assertEqual(get_browser_name(FIREFOX_MOBILE_UA_OLD),
                         'firefox mobile')
        self.assertEqual(get_browser_name(FIREFOX_TABLET_UA),
                         'firefox mobile (tablet)')
        self.assertEqual(get_browser_name(SAFARI_UA), 'safari')
        self.assertEqual(get_browser_name(SAFARI_MOBILE_UA), 'mobile safari')
        self.assertEqual(get_browser_name(SAFARI_TABLET_UA), 'mobile safari')
        self.assertEqual(get_browser_name(CHROME_UA), 'chrome')
        self.assertEqual(get_browser_name(CHROME_MOBILE_UA), 'chrome mobile')
        self.assertEqual(get_browser_name(CHROME_TABLET_UA), 'chrome')
        self.assertEqual(get_browser_name(''), 'unknown')
        self.assertEqual(get_browser_name(None), 'unknown')
        self.assertEqual(get_browser_name(), 'unknown')
        self.assertEqual(get_browser_name(u'💀'), 'unknown')
        self.assertEqual(get_browser('<script>lol()</script>'), 'Unknown')
        self.assertEqual(get_browser(True), 'Unknown')
        self.assertEqual(get_browser(False), 'Unknown')
        self.assertEqual(get_browser(None), 'Unknown')

    def test_get_browser(self):
        '''Test browser parsing via get_browser helper method.'''
        self.assertEqual(get_browser(FIREFOX_UA), 'Firefox 48.0')
        self.assertEqual(get_browser(FIREFOX_MOBILE_UA), 'Firefox Mobile 40.0')
        self.assertEqual(get_browser_name(FIREFOX_MOBILE_UA_OLD),
                         'firefox mobile')
        self.assertEqual(get_browser(FIREFOX_TABLET_UA),
                         'Firefox Mobile (Tablet) 41.0')
        self.assertEqual(get_browser(SAFARI_UA), 'Safari 9.0')
        self.assertEqual(get_browser(SAFARI_MOBILE_UA), 'Mobile Safari 6.0')
        self.assertEqual(get_browser(SAFARI_TABLET_UA), 'Mobile Safari 5.1')
        self.assertEqual(get_browser(CHROME_UA), 'Chrome 52.0.2720')
        self.assertEqual(get_browser(CHROME_MOBILE_UA),
                         'Chrome Mobile 18.0.1025')
        self.assertEqual(get_browser(CHROME_TABLET_UA), 'Chrome 18.0.1025')
        self.assertEqual(get_browser(''), 'Unknown')
        self.assertEqual(get_browser(), 'Unknown')
        self.assertEqual(get_browser(u'💀'), 'Unknown')
        self.assertEqual(get_browser('<script>lol()</script>'), 'Unknown')
        self.assertEqual(get_browser(True), 'Unknown')
        self.assertEqual(get_browser(False), 'Unknown')
        self.assertEqual(get_browser(None), 'Unknown')

    def test_get_os(self):
        '''Test OS parsing via get_os helper method.'''
        self.assertEqual(get_os(FIREFOX_UA), 'Mac OS X 10.11')
        self.assertEqual(get_os(FIREFOX_MOBILE_UA), 'Android 6.0.1')
        self.assertEqual(get_os(FIREFOX_MOBILE_UA_OLD), 'Android')
        self.assertEqual(get_os(FIREFOX_TABLET_UA), 'Android 4.4')
        self.assertEqual(get_os(SAFARI_UA), 'Mac OS X 10.11')
        self.assertEqual(get_os(SAFARI_MOBILE_UA), 'iOS 6.1.4')
        self.assertEqual(get_os(SAFARI_TABLET_UA), 'iOS 5.1.1')
        self.assertEqual(get_os(CHROME_UA), 'Mac OS X 10.11.4')
        self.assertEqual(get_os(CHROME_MOBILE_UA),
                         'Android 4.0.4')
        self.assertEqual(get_os(CHROME_TABLET_UA), 'Android 4.0.4')
        self.assertEqual(get_os(''), 'Unknown')
        self.assertEqual(get_os(), 'Unknown')
        self.assertEqual(get_os(u'💀'), 'Unknown')
        self.assertEqual(get_os('<script>lol()</script>'), 'Unknown')
        self.assertEqual(get_os(True), 'Unknown')
        self.assertEqual(get_os(False), 'Unknown')
        self.assertEqual(get_os(None), 'Unknown')


if __name__ == '__main__':
    unittest.main()
