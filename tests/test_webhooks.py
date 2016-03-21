#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for helper methods in webcompat/webhooks/helpers.py.'''

import os.path
import sys
import unittest

import webcompat
from webcompat.webhooks.helpers import extract_domain_name

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))


WWW_DOMAIN_URL = "www.net"
RESULT_WWW_DOMAIN_URL = "net"
BLOGSPOT_URL = "http://blogsofnote.blogspot.com/"
RESULT_BLOGSPOT_URL = "blogspot"
SUBSITE_URL = "https://mail.google.com"
RESULT_SUBSITE_URL = "mail.google"
SUBSITE_WWW_URL = "https://www.mail.google.com"
RESULT_SUBSITE_WWW_URL = "mail.google"
NETFLIX_URL = "https://www.netflix.co.uk"
RESULT_NETFLIX_URL = "netflix"


class TestHelpers(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_extract_domain_name(self):
        '''Test for different combinations of domain names.'''
        self.assertEqual(
            extract_domain_name(WWW_DOMAIN_URL), RESULT_WWW_DOMAIN_URL)
        self.assertEqual(
            extract_domain_name(BLOGSPOT_URL),
            RESULT_BLOGSPOT_URL)
        self.assertEqual(extract_domain_name(SUBSITE_URL), RESULT_SUBSITE_URL)
        self.assertEqual(
            extract_domain_name(SUBSITE_WWW_URL),
            RESULT_SUBSITE_WWW_URL)
        self.assertEqual(extract_domain_name(NETFLIX_URL), RESULT_NETFLIX_URL)
