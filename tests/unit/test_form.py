#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Tests for form validation."""

import json
import unittest

import pytest
from werkzeug.datastructures import MultiDict

import webcompat
from webcompat import form
from webcompat import helpers

FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0'  # noqa
FIREFOX_V100 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:100.0) Gecko/20100101 Firefox/100.0'  # noqa


class TestForm(unittest.TestCase):
    """Module for testing the form."""

    def setUp(self):
        """Set up."""
        self.maxDiff = None
        webcompat.app.config['TESTING'] = True
        self.maxDiff = None
        self.app = webcompat.app.test_client()

    def tearDown(self):
        """Tear down."""
        pass

    def test_normalize_url(self):
        """Check that URL is normalized."""
        r = form.normalize_url('http://example.com')
        self.assertEqual(r, 'http://example.com')

        r = form.normalize_url('愛')
        self.assertEqual(r, 'http://愛')

        r = form.normalize_url('http://愛')
        self.assertEqual(r, 'http://愛')

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

        r = form.normalize_url('http://https://bad.example.com')
        self.assertEqual(r, 'https://bad.example.com')

        r = form.normalize_url('http://param.example.com/?q=foo#bar')
        self.assertEqual(r, 'http://param.example.com/?q=foo#bar')

        r = form.normalize_url('')
        self.assertIsNone(r)

    def test_domain_name(self):
        """Check that domain name is extracted."""
        r = form.domain_name('http://example.com')
        self.assertEqual(r, 'example.com')

        r = form.domain_name('https://example.com')
        self.assertEqual(r, 'example.com')

        r = form.normalize_url('')
        self.assertIsNone(r)

    def test_metadata_wrapping(self):
        """Check that metadata is processed and wrapped."""
        test_dict = {'cool': 'dude', 'wow': 'ok'}
        expected_single = '<!-- @cool: dude -->\n'
        expected_single_comma = '<!-- @cool: dude, wow -->\n'
        expected_multiple = '<!-- @cool: dude -->\n<!-- @wow: ok -->\n'

        r = form.wrap_metadata(('cool', 'dude'))
        self.assertEqual(r, expected_single)

        r = form.wrap_metadata(('cool', 'dude, wow'))
        self.assertEqual(r, expected_single_comma)

        r = form.get_metadata(('cool', 'wow'), test_dict)
        self.assertEqual(r, expected_multiple)

    def test_radio_button_label(self):
        """Check that appropriate radio button label is returned."""
        tests_labels_lists = [
            [('detection_bug', 'i.svg', 'Desktop site instead of mobile site'),
             ('unknown_bug', 'b.svg', 'Something else')],
            [('detection_bug', 'Desktop site instead of mobile site'),
             ('unknown_bug', 'Something else')],
        ]

        for test_labels_list in tests_labels_lists:
            r = form.get_radio_button_label('unknown_bug', test_labels_list)
            self.assertEqual(r, 'Something else')
            r = form.get_radio_button_label('detection_bug', test_labels_list)
            self.assertEqual(r, 'Desktop site instead of mobile site')
            r = form.get_radio_button_label(None, test_labels_list)
            self.assertEqual(r, 'Unknown')
            r = form.get_radio_button_label('failme', test_labels_list)
            self.assertEqual(r, 'Unknown')

    def test_get_form(self):
        """Check we return the right form with the appropriate data."""
        with webcompat.app.test_request_context('/issues/new'):
            form_data = {'user_agent': FIREFOX_UA,
                         'url': 'http://example.net/',
                         'src': 'desktop-reporter'}
            actual = form.get_form(form_data)
            expected_browser = 'Firefox 48.0'
            expected_os = 'Mac OS X 10.11'
            self.assertIsInstance(actual, form.FormWizard)
            self.assertEqual(actual.browser.data, expected_browser)
            self.assertEqual(actual.os.data, expected_os)
            self.assertEqual(actual.reported_with.data, 'desktop-reporter')

    def test_get_metadata(self):
        """HTML comments need the right values depending on the keys."""
        metadata_keys = ('sky', 'earth')
        form_object = {'blah': 'goo', 'hello': 'moshi', 'sky': 'blue'}
        actual = form.get_metadata(metadata_keys, form_object)
        expected = '<!-- @sky: blue -->\n<!-- @earth: None -->\n'
        self.assertEqual(actual, expected)
        form_object = MultiDict([
            ('reported_with', 'desktop-reporter'),
            ('url', 'http://localhost:5000/issues/new'),
            ('extra_labels', ['type-webrender-enabled']),
            ('ua_header', 'Mozilla/5.0...Firefox 59.0'),
            ('browser', 'Firefox 59.0')])
        metadata_keys = ['browser', 'ua_header', 'reported_with',
                         'extra_labels']
        actual = form.get_metadata(metadata_keys, form_object)
        expected = '<!-- @browser: Firefox 59.0 -->\n<!-- @ua_header: Mozilla/5.0...Firefox 59.0 -->\n<!-- @reported_with: desktop-reporter -->\n<!-- @extra_labels: type-webrender-enabled -->\n'  # noqa
        self.assertEqual(actual, expected)

    def test_get_metadata_browser_as_extra(self):
        """Test that we can handle a browser-foo inside of EXTRA_LABELS."""
        form_object = MultiDict([
            ('reported_with', 'desktop-reporter'),
            ('url', 'http://localhost:5000/issues/new'),
            ('extra_labels', ['browser-focus-geckoview']),
            ('ua_header', 'Mozilla/5.0...Firefox 59.0'),
            ('browser', 'Firefox 59.0')])
        metadata_keys = ['browser', 'ua_header', 'reported_with',
                         'extra_labels']
        actual = form.get_metadata(metadata_keys, form_object)
        expected = '<!-- @browser: Firefox 59.0 -->\n<!-- @ua_header: Mozilla/5.0...Firefox 59.0 -->\n<!-- @reported_with: desktop-reporter -->\n<!-- @extra_labels: browser-focus-geckoview -->\n'  # noqa
        self.assertEqual(actual, expected)

    def test_bad_extra_labels_get_removed(self):
        """Test that filtering out of not accepted EXTRA_LABELS is working.

        type-punkcat is not a valid extra label
        """
        form_object = MultiDict([
            ('reported_with', 'mobile-reporter'),
            ('url', 'http://localhost:5000/issues/new'),
            ('extra_labels', ['browser-firefox-ios',
                              'device-tablet', 'type-punkcat']),
            ('ua_header', 'Mozilla/5.0...Firefox 91.0'),
            ('browser', 'Firefox 91.0')])
        metadata_keys = ['browser', 'ua_header', 'reported_with',
                         'extra_labels']
        actual = form.get_metadata(metadata_keys, form_object)
        expected = '<!-- @browser: Firefox 91.0 -->\n<!-- @ua_header: Mozilla/5.0...Firefox 91.0 -->\n<!-- @reported_with: mobile-reporter -->\n<!-- @extra_labels: browser-firefox-ios, device-tablet -->\n'  # noqa
        self.assertEqual(actual, expected)

    def test_extra_labels_version100(self):
        """Test that we set version100 for extra_labels."""
        form_object = MultiDict([
            ('reported_with', 'desktop-reporter'),
            ('url', 'http://localhost:5000/issues/new'),
            ('extra_labels', ['version100']),
            ('ua_header', FIREFOX_V100),
            ('browser', 'Firefox 100.0')])
        metadata_keys = ['browser', 'ua_header', 'reported_with',
                         'extra_labels']
        actual = form.get_metadata(metadata_keys, form_object)
        expected = '<!-- @browser: Firefox 100.0 -->\n<!-- @ua_header: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:100.0) Gecko/20100101 Firefox/100.0 -->\n<!-- @reported_with: desktop-reporter -->\n<!-- @extra_labels: version100 -->\n'  # noqa
        self.assertEqual(actual, expected)

    def test_normalize_metadata(self):
        """Avoid some type of strings."""
        cases = [('blue sky -->', 'blue sky'),
                 ('blue sky ---->>', 'blue sky'),
                 ('', ''),
                 ('blue sky ', 'blue sky'),
                 ('bad_bird <script>', ''),
                 ('bad_bird <script-->>', ''),
                 ('a' * 300, ''),
                 (None, None),
                 ]
        for meta_value, expected in cases:
            self.assertEqual(form.normalize_metadata(meta_value), expected)

    def test_build_formdata(self):
        """The data body sent to GitHub API."""
        # we just need to test that nothing breaks
        # even if the data are empty
        form_object = {'foo': 'bar'}
        actual = form.build_formdata(form_object)
        expected = {'body': '<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n\n**URL**: None\n\n**Browser / Version**: None\n**Operating System**: None\n**Tested Another Browser**: Unknown \n\n**Problem type**: Unknown\n**Description**: None\n**Steps to Reproduce**:\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': 'None - unknown'}  # noqa
        self.assertIs(type(actual), dict)
        self.assertEqual(actual, expected)
        # testing for double URL Schemes.
        form_object = {'url': 'http://https://example.com/'}
        actual = form.build_formdata(form_object)
        expected = {'body': '<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n\n**URL**: https://example.com/\n\n**Browser / Version**: None\n**Operating System**: None\n**Tested Another Browser**: Unknown \n\n**Problem type**: Unknown\n**Description**: None\n**Steps to Reproduce**:\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': 'example.com - unknown'}  # noqa
        self.assertEqual(actual, expected)
        # testing with unicode strings.
        form_object = {'url': '愛'}
        actual = form.build_formdata(form_object)
        expected = {'body': '<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n\n**URL**: http://\u611b\n\n**Browser / Version**: None\n**Operating System**: None\n**Tested Another Browser**: Unknown \n\n**Problem type**: Unknown\n**Description**: None\n**Steps to Reproduce**:\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': '\u611b - unknown'}  # noqa
        self.assertEqual(actual, expected)

    def test_build_formdata_with_add_metadata(self):
        """The data body sent to GitHub API, with additional metadata."""
        # we just need to test that nothing breaks
        # even if the data are empty
        form_object = {'foo': 'bar'}
        form_object = form.add_metadata(form_object, {'public_url':
                                        'https://public.example.com'})
        actual = form.build_formdata(form_object)
        expected = {'body': '<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n<!-- @public_url: https://public.example.com -->\n\n**URL**: None\n\n**Browser / Version**: None\n**Operating System**: None\n**Tested Another Browser**: Unknown \n\n**Problem type**: Unknown\n**Description**: None\n**Steps to Reproduce**:\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': 'None - unknown'}  # noqa
        self.assertIs(type(actual), dict)
        self.assertEqual(actual, expected)
        form_object2 = form.add_metadata(form_object, {'foo': 'bar'})
        actual2 = form.build_formdata(form_object2)
        expected = {'body': '<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n<!-- @foo: bar -->\n\n**URL**: None\n\n**Browser / Version**: None\n**Operating System**: None\n**Tested Another Browser**: Unknown \n\n**Problem type**: Unknown\n**Description**: None\n**Steps to Reproduce**:\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': 'None - unknown'}  # noqa
        self.assertIs(type(actual2), dict)
        self.assertEqual(actual2, expected)
        form_object3 = form.add_metadata(form_object, {'😀': '😅'})
        actual3 = form.build_formdata(form_object3)
        expected = {'body': '<!-- @browser: None -->\n<!-- @ua_header: None -->\n<!-- @reported_with: None -->\n<!-- @😀: 😅 -->\n\n**URL**: None\n\n**Browser / Version**: None\n**Operating System**: None\n**Tested Another Browser**: Unknown \n\n**Problem type**: Unknown\n**Description**: None\n**Steps to Reproduce**:\nNone\n\n\n\n_From [webcompat.com](https://webcompat.com/) with \u2764\ufe0f_', 'title': 'None - unknown'}  # noqa
        self.assertIs(type(actual3), dict)
        self.assertEqual(actual3, expected)

    def test_get_details_list(self):
        """Assert we handle valid dict and other values."""
        actual_string_arg = form.get_details_list('cool')
        expected_string_arg = '<ul>\n  <li>cool</li>\n</ul>'
        self.assertEqual(actual_string_arg, expected_string_arg)
        actual_dict_arg = form.get_details_list({'a': 'b', 'c': False})
        expected_dict_arg = '<ul>\n  <li>a: b</li><li>c: false</li>\n</ul>'
        self.assertEqual(actual_dict_arg, expected_dict_arg)

    def test_build_details(self):
        """Expected HTML is returned for a json object or a string."""
        # Test for receiving JSON object as a string
        actual_json_arg = form.build_details(json.dumps(
            {'a': 'b', 'c': False}))
        expected_json_arg = '<details>\n<summary>Browser Configuration</summary>\n<ul>\n  <li>a: b</li><li>c: false</li>\n</ul>\n</details>'  # noqa
        self.assertEqual(actual_json_arg, expected_json_arg)
        # Test for receiving a JSON value which is not an object
        actual_json_arg = form.build_details('null')
        expected_json_arg = '<details>\n<summary>Browser Configuration</summary>\n<ul>\n  <li>None</li>\n</ul>\n</details>'  # noqa
        self.assertEqual(actual_json_arg, expected_json_arg)
        # Test for receiving a string
        actual_string_arg = form.build_details('cool')
        expected_string_arg = '<details>\n<summary>Browser Configuration</summary>\n<ul>\n  <li>cool</li>\n</ul>\n</details>'  # noqa
        self.assertEqual(actual_string_arg, expected_string_arg)

    def test_build_details_without_console_logs(self):
        """Expected HTML is returned for a json object without console logs."""
        actual_json_arg = form.build_details(json.dumps(
            {'a': 'b', 'c': False, 'consoleLog': ['console.log(hi)']}))
        expected_json_arg = '<details>\n<summary>Browser Configuration</summary>\n<ul>\n  <li>a: b</li><li>c: false</li>\n</ul>\n</details>'  # noqa
        self.assertEqual(actual_json_arg, expected_json_arg)
        actual_empty_log_arg = form.build_details(json.dumps(
            {'a': 'b', 'c': False, 'consoleLog': ''}))
        expected_empty_log_arg = '<details>\n<summary>Browser Configuration</summary>\n<ul>\n  <li>a: b</li><li>c: false</li>\n</ul>\n</details>'  # noqa
        self.assertEqual(actual_empty_log_arg, expected_empty_log_arg)

    def test_get_console_logs_url(self):
        """Assert we return an empty string, or a link to console logs page."""
        actual_empty_arg = form.get_console_logs_url('')
        expected_empty_arg = ''
        self.assertEqual(actual_empty_arg, expected_empty_arg)
        actual_none_arg = form.get_console_logs_url(None)
        self.assertEqual(actual_none_arg, expected_empty_arg)
        actual_stringy_arg = form.get_console_logs_url('some url')
        expected_stringy_arg = '\n\n[View console log messages](some url)'
        self.assertEqual(actual_stringy_arg, expected_stringy_arg)

    def test_is_valid_issue_form(self):
        """Assert that we get the form parameters we want."""
        cookie = 'exp=form-v1; Path=/'
        with webcompat.app.test_request_context(
                environ_base={'HTTP_COOKIE': cookie}):
            webcompat.app.preprocess_request()

            incomplete_form = MultiDict([('problem_category', 'unknown_bug')])
            self.assertFalse(helpers.is_valid_issue_form(incomplete_form))
            valid_form = MultiDict([
                ('browser', 'Firefox 61.0'),
                ('description', 'streamlining the form.'),
                ('details', ''),
                ('os', 'Mac OS X 10.13'),
                ('problem_category', 'unknown_bug'),
                ('submit_type', 'github-auth-report'),
                ('url', 'http://2479.example.com'),
                ('username', ''), ])
            self.assertTrue(helpers.is_valid_issue_form(valid_form))
            # The value for submit-Type can be only:
            # - github-auth-report
            # - github-proxy-report
            wrong_value_form = MultiDict([
                ('browser', 'Firefox 61.0'),
                ('description', 'streamlining the form.'),
                ('details', ''),
                ('os', 'Mac OS X 10.13'),
                ('problem_category', 'unknown_bug'),
                ('submit_type', 'wrong-value'),
                ('url', 'http://2479.example.com'),
                ('username', ''), ])
            self.assertFalse(helpers.is_valid_issue_form(wrong_value_form))

    def test_is_blocked_domain(self):
        """Assert domains validity in issue reporting."""
        self.assertTrue(helpers.is_blocked_domain('coco.fr'))
        self.assertFalse(helpers.is_blocked_domain('w3.org'))

    def test_report_issue_anonymous_fails_with_wrong_credentials(self):
        """Report issue should not be working if wrong credentials."""
        with webcompat.app.app_context():
            rv = self.app.post(
                '/issues/new',
                content_type='multipart/form-data',
                data=dict(
                    browser='Firefox Mobile 45.0',
                    description='testing 2971',
                    os='macos',
                    problem_category='yada',
                    submit_type='punkcat-submit',
                    url='http://testing.example.org',
                    username='yeeha'))
            self.assertEqual(rv.status_code, 400)


@pytest.mark.parametrize(
    'test_input,expected',
    [({}, 'web'),
     ({'src': ''}, 'unknown'),
     ({'src': 'punkCat'}, 'unknown'),
     ({'src': 'mobile-reporter'}, 'mobile-reporter'),
     ]
)
def test_report_source(test_input, expected):
    """Extract the reporting source when valid and invalid."""
    assert form.extract_report_source(test_input) == expected


if __name__ == '__main__':
    unittest.main()
