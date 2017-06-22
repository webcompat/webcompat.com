#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''Tests for form validation.'''

import unittest
from webcompat import form


class TestForm(unittest.TestCase):

    def test_normalize_url(self):
        """Checks that URL is normalized."""
        r = form.normalize_url('http://example.com')
        self.assertEqual(r, 'http://example.com')

        r = form.normalize_url('https://example.com')
        self.assertEqual(r, 'https://example.com')

        r = form.normalize_url('example.com')
        self.assertEqual(r, 'http://example.com')

        r = form.normalize_url('http:/example.com')
        self.assertEqual(r, 'http://example.com')

        r = form.normalize_url('https:/example.com')
        self.assertEqual(r, 'https://example.com')

        r = form.normalize_url('http:example.com')
        self.assertEqual(r, 'http://example.com')

        r = form.normalize_url('https:example.com')
        self.assertEqual(r, 'https://example.com')

        r = form.normalize_url('//example.com')
        self.assertEqual(r, 'http://example.com')

    def test_domain_name(self):
        """Checks that domain name is extracted."""
        r = form.domain_name('http://example.com')
        self.assertEqual(r, 'example.com')

        r = form.domain_name('https://example.com')
        self.assertEqual(r, 'example.com')

    def test_metadata_wrapping(self):
        """Checks that metadata is processed and wrapped."""
        TEST_DICT = {'cool': 'dude', 'wow': 'ok'}
        EXPECTED_SINGLE = '<!-- @cool: dude -->\n'
        EXPECTED_MULTIPLE = '<!-- @cool: dude -->\n<!-- @wow: ok -->\n'

        r = form.wrap_metadata(('cool', 'dude'))
        self.assertEqual(r, EXPECTED_SINGLE)

        r = form.get_metadata(('cool', 'wow'), TEST_DICT)
        self.assertEqual(r, EXPECTED_MULTIPLE)

    def test_radio_button_label(self):
        '''Checks that appropriate radio button label is returned.'''
        TEST_LABELS_LIST = [
            (u'detection_bug', u'Desktop site instead of mobile site'),
            (u'unknown_bug', u'Something else')
        ]

        r = form.get_radio_button_label('unknown_bug', TEST_LABELS_LIST)
        self.assertEqual(r, u'Something else')

        r = form.get_radio_button_label(u'detection_bug', TEST_LABELS_LIST)
        self.assertEqual(r, u'Desktop site instead of mobile site')

        r = form.get_radio_button_label(None, TEST_LABELS_LIST)
        self.assertEqual(r, u'Unknown')

        r = form.get_radio_button_label('failme', TEST_LABELS_LIST)
        self.assertEqual(r, u'Unknown')
