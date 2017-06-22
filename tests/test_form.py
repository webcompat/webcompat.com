#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''Tests for form validation.'''

import unittest

import webcompat
from webcompat import form

FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0'  # nopep8


class TestForm(unittest.TestCase):

    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

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

        r = form.normalize_url('')
        self.assertIsNone(r)

    def test_domain_name(self):
        """Checks that domain name is extracted."""
        r = form.domain_name('http://example.com')
        self.assertEqual(r, 'example.com')

        r = form.domain_name('https://example.com')
        self.assertEqual(r, 'example.com')

        r = form.normalize_url('')
        self.assertIsNone(r)

    def test_metadata_wrapping(self):
        """Checks that metadata is processed and wrapped."""
        TEST_DICT = {'cool': 'dude', 'wow': 'ok'}
        EXPECTED_SINGLE = '<!-- @cool: dude -->\n'
        EXPECTED_MULTIPLE = '<!-- @cool: dude -->\n<!-- @wow: ok -->\n'

        r = form.wrap_metadata(('cool', 'dude'))
        self.assertEqual(r, EXPECTED_SINGLE)

        r = form.get_metadata(('cool', 'wow'), TEST_DICT)
        self.assertEqual(r, EXPECTED_MULTIPLE)

    def test_get_form(self):
        """Checks we return the right form with the appropriate data."""
        with webcompat.app.test_request_context('/'):
            actual = form.get_form(FIREFOX_UA)
            expected_browser = 'Firefox 48.0'
            expected_os = 'Mac OS X 10.11'
            self.assertIsInstance(actual, form.IssueForm)
            self.assertEqual(actual.browser.data, expected_browser)
            self.assertEqual(actual.os.data, expected_os)

    def test_get_problem(self):
        """Checks we get the appropriate category."""
        actual = form.get_problem(u'text_bug')
        expected = u'Text is not visible'
        self.assertEqual(actual, expected)
        actual = form.get_problem(u'foobar2017')
        expected = u'Unknown'
        self.assertEqual(actual, expected)

    def test_get_problem_summary(self):
        """Problem summary is the string going to the title."""
        actual = form.get_problem_summary(u'unknown_bug')
        expected = u'see bug description'
        self.assertEqual(actual, expected)
        actual = form.get_problem_summary(u'text_bug')
        expected = u'text is not visible'
        self.assertEqual(actual, expected)

    def test_get_metadata(self):
        """HTML comments need the right values depending on the keys."""
        metadata_keys = ('sky', 'earth')
        form_object = {'blah': 'goo', 'hello': 'moshi', 'sky': 'blue'}
        actual = form.get_metadata(metadata_keys, form_object)
        expected = u'<!-- @sky: blue -->\n<!-- @earth: None -->\n'
        self.assertEqual(actual, expected)

    def test_build_formdata(self):
        """The data body sent to GitHup API."""
        form_object = {'foo': 'bar'}
        actual = form.build_formdata(form_object)
        # we just need to test that nothing breaks
        # even if the data are empty
        expected = {'body': u'<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n\n**URL**: None\n**Browser / Version**: None\n**Operating System**: None\n**Problem type**: Unknown\n\n**Steps to Reproduce**\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': 'None - unknown'}  # nopep8
        self.assertIs(type(actual), dict)
        self.assertEqual(actual, expected)
