#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''Tests for form validation.'''

import unittest
from webcompat import form


class TestForm(unittest.TestCase):

    def test_normalize_url(self):

        r = form.normalize_url('example.com')
        self.assertEqual(r, 'http://example.com/')

        r = form.normalize_url('http:/example.com')
        self.assertEqual(r, 'http://example.com/')

        r = form.normalize_url('https:/example.com')
        self.assertEqual(r, 'https://example.com/')

        r = form.normalize_url('http:example.com')
        self.assertEqual(r, 'http://example.com/')

        r = form.normalize_url('https:example.com')
        self.assertEqual(r, 'https://example.com/')


    def test_domain_name(self):
        
        r = form.domain_name("http://example.com")
        self.assertEqual(r, "example.com")

        r = form.domain_name("https://example.com")
        self.assertEqual(r, "example.com")
