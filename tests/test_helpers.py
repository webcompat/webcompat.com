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

from webcompat.helpers import rewrite_links
from webcompat.helpers import sanitize_link
from webcompat.helpers import rewrite_and_sanitize_link

ACCESS_TOKEN_LINK = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3&access_token=12345>; rel="next", <https://api.github.com/repositories/17839063/issues?access_token=12345&per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&access_token=12345&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1&access_token=12345>; rel="prev"'
GITHUB_ISSUES_LINK_HEADER = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3>; rel="next", <https://api.github.com/repositories/17839063/issues?per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="prev"'
GITHUB_SEARCH_LINK_HEADER = '<https://api.github.com/search/issues?q=taco&page=2>; rel="next", <https://api.github.com/search/issues?q=taco&page=26>; rel="last"'
REWRITTEN_ISSUES_LINK_HEADER = '</api/issues?per_page=50&page=3>; rel="next", </api/issues?per_page=50&page=4>; rel="last", </api/issues?per_page=50&page=1>; rel="first", </api/issues?per_page=50&page=1>; rel="prev"'
REWRITTEN_SEARCH_LINK_HEADER = '</api/issues/search?q=taco&page=2>; rel="next", </api/issues/search?q=taco&page=26>; rel="last"'


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


if __name__ == '__main__':
    unittest.main()
