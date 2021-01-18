#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for helper methods in webcompat/helpers.py."""

import json
from unittest.mock import Mock
from unittest.mock import patch
import unittest

import flask
from flask import session
from requests.models import Response
from werkzeug.http import parse_cookie

import webcompat
from webcompat.helpers import ab_active
from webcompat.helpers import ab_current_experiments
from webcompat.helpers import ab_init
from webcompat.helpers import form_type
from webcompat.helpers import format_link_header
from webcompat.helpers import get_browser
from webcompat.helpers import get_browser_name
from webcompat.helpers import get_name
from webcompat.helpers import get_os
from webcompat.helpers import get_response_headers
from webcompat.helpers import get_serialized_value
from webcompat.helpers import get_version_string
from webcompat.helpers import is_json_object
from webcompat.helpers import normalize_api_params
from webcompat.helpers import prepare_form
from webcompat.helpers import rewrite_and_sanitize_link
from webcompat.helpers import rewrite_links
from webcompat.helpers import sanitize_link
from webcompat.helpers import get_extra_labels
from webcompat.helpers import get_filename_from_url
from webcompat.helpers import is_darknet_domain


ACCESS_TOKEN_LINK = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3&access_token=12345>; rel="next", <https://api.github.com/repositories/17839063/issues?access_token=12345&per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&access_token=12345&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1&access_token=12345>; rel="prev"'  # noqa
GITHUB_ISSUES_LINK_HEADER = '<https://api.github.com/repositories/17839063/issues?per_page=50&page=3>; rel="next", <https://api.github.com/repositories/17839063/issues?per_page=50&page=4>; rel="last", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="first", <https://api.github.com/repositories/17839063/issues?per_page=50&page=1>; rel="prev"'  # noqa
REWRITTEN_ISSUES_LINK_HEADER = '</api/issues?per_page=50&page=3>; rel="next", </api/issues?per_page=50&page=4>; rel="last", </api/issues?per_page=50&page=1>; rel="first", </api/issues?per_page=50&page=1>; rel="prev"'  # noqa
GITHUB_SEARCH_LINK_HEADER = '<https://api.github.com/search/issues?q=taco&page=2>; rel="next", <https://api.github.com/search/issues?q=taco&page=26>; rel="last"'  # noqa
REWRITTEN_SEARCH_LINK_HEADER = '</api/issues/search?q=taco&page=2>; rel="next", </api/issues/search?q=taco&page=26>; rel="last"'  # noqa
GITHUB_COMMENTS_LINK_HEADER = '<https://api.github.com/repositories/17839063/issues/398/comments?page=2>; rel="next", <https://api.github.com/repositories/17839063/issues/398/comments?page=4>; rel="last"'  # noqa
REWRITTEN_COMMENTS_LINK_HEADER = '</api/issues/398/comments?page=2>; rel="next", </api/issues/398/comments?page=4>; rel="last"'  # noqa
PARSED_LINKED_HEADERS = [{'url': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=3', 'rel': 'next'}, {'url': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=4', 'rel': 'last'}, {'url': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=1', 'rel': 'first'}, {'url': 'https://api.github.com/repositories/17839063/issues?per_page=50&page=1', 'rel': 'prev'}]  # noqa
FIREFOX_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:48.0) Gecko/20100101 Firefox/48.0'  # noqa
FIREFOX_MOBILE_UA_OLD = 'Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0'  # noqa
FIREFOX_MOBILE_UA = 'Mozilla/5.0 (Android 6.0.1; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0'  # noqa
FIREFOX_TABLET_UA = 'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0'  # noqa
SAFARI_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.39 (KHTML, like Gecko) Version/9.0 Safari/601.1.39'  # noqa
SAFARI_MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10B350 Safari/8536.25'  # noqa
SAFARI_TABLET_UA = 'Mozilla/5.0 (iPad; CPU OS 5_1_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B206 Safari/7534.48.3'  # noqa
CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2720.0 Safari/537.36'  # noqa
CHROME_MOBILE_UA = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19'  # noqa
CHROME_TABLET_UA = 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Safari/535.19'  # noqa


class TestHelpers(unittest.TestCase):
    """Class for testing helpers."""

    def setUp(self):
        """Set up the tests."""
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        """Tear down the tests."""
        webcompat.app.config['AB_EXPERIMENTS'] = {
            'exp': {
                'variations': {
                    'ui-change-v1': (0, 100)
                },
                'max-age': 86400
            }
        }
        pass

    def test_rewrite_link(self):
        """Test we're correctly rewriting the passed in link."""
        self.assertEqual(rewrite_links(GITHUB_ISSUES_LINK_HEADER),
                         REWRITTEN_ISSUES_LINK_HEADER)
        self.assertEqual(rewrite_links(GITHUB_SEARCH_LINK_HEADER),
                         REWRITTEN_SEARCH_LINK_HEADER)
        self.assertEqual(rewrite_links(GITHUB_COMMENTS_LINK_HEADER),
                         REWRITTEN_COMMENTS_LINK_HEADER)

    def test_sanitize_link(self):
        """Test that we're removing access_token parameters."""
        self.assertNotIn('access_token=', sanitize_link(ACCESS_TOKEN_LINK))

    def test_rewrite_and_sanitize_link(self):
        """Rewrite and Sanitize Links test."""
        self.assertNotIn('access_token=',
                         rewrite_and_sanitize_link(ACCESS_TOKEN_LINK))
        self.assertEqual(rewrite_and_sanitize_link(ACCESS_TOKEN_LINK),
                         REWRITTEN_ISSUES_LINK_HEADER)

    def test_normalize_api_params_converts_correctly(self):
        """Test that API params are correctly converted to Search API."""
        self.assertEqual(normalize_api_params({'direction': 'desc'}),
                         {'order': 'desc'})
        self.assertNotIn('direction',
                         normalize_api_params({'direction': 'desc'}))

        self.assertEqual(normalize_api_params({'state': 'closed', 'q': 'hi'}),
                         {'q': 'hi state:closed'})
        self.assertNotIn('state',
                         normalize_api_params({'state': 'closed', 'q': 'hi'}))

        self.assertEqual(normalize_api_params({'mentioned': 'coolguy',
                                              'q': 'hi'}),
                         {'q': 'hi mentions:coolguy'})
        self.assertNotIn('mentioned',
                         normalize_api_params({'mentioned': 'coolguy',
                                              'q': 'hi'}))

        self.assertEqual(normalize_api_params({'creator': 'coolguy',
                                              'q': 'hi'}),
                         {'q': 'hi author:coolguy'})
        self.assertNotIn('creator',
                         normalize_api_params({'creator': 'coolguy',
                                              'q': 'hi'}))

        multi_before = {'direction': 'desc', 'state': 'closed',
                        'mentioned': 'coolguy', 'creator': 'coolguy',
                        'per_page': '1', 'q': 'hi'}
        multi_after = {'order': 'desc',
                       'q': 'hi state:closed author:coolguy mentions:coolguy',
                       'per_page': '1'}
        self.assertEqual(normalize_api_params(multi_before), multi_after)

    def test_normalize_api_params_ignores_unknown_params(self):
        """Ignore unknown parameters in normalize_api_params."""
        self.assertEqual({'foo': 'bar'},
                         normalize_api_params({'foo': 'bar'}))
        self.assertEqual({'order': 'desc', 'foo': 'bar'},
                         normalize_api_params({'foo': 'bar',
                                              'direction': 'desc'}))

    def test_format_http_link_headers(self):
        """Test HTTP Links formating."""
        parsed_headers = PARSED_LINKED_HEADERS
        link_header = GITHUB_ISSUES_LINK_HEADER
        self.assertEqual(format_link_header(parsed_headers), link_header)

    def test_get_browser_name(self):
        """Test browser name parsing via get_browser_name helper method."""
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
        self.assertEqual(get_browser_name('💀'), 'unknown')
        self.assertEqual(get_browser_name('<script>lol()</script>'), 'unknown')
        self.assertEqual(get_browser_name(True), 'unknown')
        self.assertEqual(get_browser_name(False), 'unknown')
        self.assertEqual(get_browser_name(None), 'unknown')

    def test_get_browser(self):
        """Test browser parsing via get_browser helper method."""
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
        self.assertEqual(get_browser('💀'), 'Unknown')
        self.assertEqual(get_browser('<script>lol()</script>'), 'Unknown')
        self.assertEqual(get_browser(True), 'Unknown')
        self.assertEqual(get_browser(False), 'Unknown')
        self.assertEqual(get_browser(None), 'Unknown')

    def test_get_os(self):
        """Test OS parsing via get_os helper method."""
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
        self.assertEqual(get_os('💀'), 'Unknown')
        self.assertEqual(get_os('<script>lol()</script>'), 'Unknown')
        self.assertEqual(get_os(True), 'Unknown')
        self.assertEqual(get_os(False), 'Unknown')
        self.assertEqual(get_os(None), 'Unknown')

    def test_get_serialized_value(self):
        """Get an expected string, including Python to js-style boolean.

        Note: key (output) and value (input) are in an unexpected order,
        just to keep the data structure valid.
        """
        tests = [{'1': 1}, {'null': None}, {'true': True}, {'false': False},
                 {'': ''}, {'cool': 'cool'}, {'\U0001f480': '💀'},
                 {'<ul>\n  <li>hi: there</li>\n</ul>': [{'hi': 'there'}]}]
        for test in tests:
            for output, browser_input in test.items():
                self.assertEqual(get_serialized_value(browser_input), output)

    def test_get_version_string(self):
        """Test version string composition.

        From Dict via get_version_string helper method.
        """
        tests = [
            [{'major': '10', 'minor': '4', 'patch': '3'}, '10.4.3'],
            [{'major': '10', 'minor': '4', 'patch': None}, '10.4'],
            [{'major': '10', 'minor': None, 'patch': '3'}, '10'],
            [{'major': '10', 'minor': None, 'patch': None}, '10'],
            [{'major': None, 'minor': None, 'patch': None}, ''],
            [{'major': None, 'minor': '4', 'patch': None}, ''],
            [{'major': None, 'minor': '4', 'patch': '3'}, ''],
            [{'tinker': '10', 'tailor': '4', 'soldier': '3'}, ''],
        ]
        for test in tests:
            self.assertEqual(get_version_string(test[0]), test[1])

    def test_get_name(self):
        """Test name extraction from Dict via get_name helper method."""
        self.assertEqual(get_name({'family': 'Chrome'}), 'Chrome')
        self.assertEqual(get_name({'family': 'Mac OS X'}), 'Mac OS X')
        self.assertEqual(get_name({'family': 'Other'}), 'Unknown')

    def test_form_type(self):
        """Define which type of request for /issues/new."""
        with webcompat.app.test_request_context(
                '/issues/new?url=http://example.com/',
                method='GET'):
            self.assertEqual(form_type(flask.request), 'prefill')
        with webcompat.app.test_request_context(
                '/issues/new',
                json={'url': 'http://example.com/'},
                method='POST'):
            self.assertEqual(form_type(flask.request), 'prefill')
        with webcompat.app.test_request_context(
                '/issues/new',
                content_type='multipart/form-data',
                data={'foo': 'blah'},
                method='POST'):
            self.assertEqual(form_type(flask.request), 'create')
        with webcompat.app.test_request_context(
                '/issues/new',
                data={'url': 'http://example.com/'},
                method='POST'):
            self.assertEqual(form_type(flask.request), None)

    def test_prepare_form_get(self):
        """Extract information of a form request with a GET."""
        form_data = {'extra_labels': ['type-stylo'],
                     'src': 'web',
                     'user_agent': 'Burger',
                     'url': 'http://example.net/',
                     }
        with webcompat.app.test_request_context(
                '/issues/new?url=http://example.net/&src=web&label=type-stylo',
                method='GET',
                headers={'User-agent': 'Burger'}):
            self.assertEqual(prepare_form(flask.request), form_data)
        # Testing that we keep processing
        # even when some parameters are not defined.
        with webcompat.app.test_request_context(
                '/issues/new?src=web&label=type-stylo',
                method='GET',
                headers={'User-agent': 'Burger'}):
            # URL is not defined
            form_data['url'] = None
            self.assertEqual(prepare_form(flask.request), form_data)
        # Testing with non-valid extra-labels. For now we keep them.
        # They are filtered by form.py
        with webcompat.app.test_request_context(
                '/issues/new?src=web&label=type-punkcat&label=type-webvr',
                method='GET',
                headers={'User-agent': 'Burger'}):
            form_data['url'] = None
            form_data['extra_labels'] = ['type-punkcat', 'type-webvr']
            self.assertEqual(prepare_form(flask.request), form_data)

    def test_prepare_form_post(self):
        """Extract information of a form request with a POST."""
        json_data = {'extra_labels': ['type-webvr', 'type-media'],
                     'src': 'addon',
                     'user_agent': 'BurgerJSON',
                     'url': 'http://json.example.net/',
                     }
        with webcompat.app.test_request_context(
                '/issues/new?url=http://example.net/&src=web&label=type-stylo',
                headers={'User-agent': 'Burger',
                         'Content-Type': 'application/json'},
                json=json_data,
                method='POST'):
            self.assertEqual(prepare_form(flask.request), json_data)

    def test_json_object(self):
        """Check if we return the right type of each JSON."""
        # A simple JSON object
        self.assertTrue(is_json_object(json.loads('{"a": "b"}')))
        # A more complex JSON object
        self.assertTrue(is_json_object(json.loads('{"bar":["baz", null, 1.0, 2]}')))  # noqa
        # A JSON value, which is not an object
        self.assertFalse(is_json_object(json.loads('null')))

    def test_ab_active_existing_cookie(self):
        """Check if `ab_active` returns the experiment variation when
        expirement cookie exists.
        """
        cookie = 'exp=ui-change-v1; Path=/'
        with webcompat.app.test_request_context(
                '/',
                method='GET',
                environ_base={'HTTP_COOKIE': cookie}):

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp': {
                    'variations': {
                        'ui-change-v1': (0, 100)
                    },
                    'max-age': 86400
                }
            }
            webcompat.app.preprocess_request()

            self.assertEqual(ab_active('exp'), 'ui-change-v1')

    def test_ab_active_non_existing_cookie(self):
        """Check if `ab_active` returns the correct experiment variation
        when the experiment cookie doesn't exist.
        """
        cookie = 'another_exp=backend-change-v1; Path=/'
        with webcompat.app.test_request_context(
                '/',
                method='GET',
                environ_base={'HTTP_COOKIE': cookie}):

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp': {
                    'variations': {
                        'ui-change-v1': (0, 100)
                    },
                    'max-age': 86400
                }
            }
            webcompat.app.preprocess_request()

            self.assertEqual(ab_active('exp'), 'ui-change-v1')

    def test_ab_current_experiments_active(self):
        """Check if current experiments are calculated properly"""
        cookie = 'exp=ui-change-v1; Path=/'
        with webcompat.app.test_request_context(
                '/',
                method='GET',
                environ_base={'HTTP_COOKIE': cookie}):

            user = Mock()
            user.user_id = 'user_id'
            flask.g.user = user

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp': {
                    'variations': {
                        'ui-change-v1': (0, 100)
                    },
                    'max-age': 86400
                }
            }

            c = ab_current_experiments()
            self.assertEqual(c, {'exp': 'ui-change-v1'})

    def test_ab_current_experiments_dnt(self):
        """Check if calculating current experiments respects DNT"""
        cookie = 'exp=ui-change-v1; Path=/'
        with webcompat.app.test_request_context(
                '/',
                method='GET',
                environ_base={'HTTP_COOKIE': cookie, 'HTTP_DNT': '1'}):

            user = Mock()
            user.user_id = 'user_id'
            flask.g.user = user

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp': {
                    'variations': {
                        'ui-change-v1': (0, 100)
                    },
                    'max-age': 86400
                }
            }

            c = ab_current_experiments()
            self.assertEqual(c, {})

    def test_ab_current_experiments_selector(self):
        """Check if current experiments selects the expected variations"""
        with webcompat.app.test_request_context(
                '/',
                method='GET'):

            user = Mock()
            user.user_id = 'user_id'
            flask.g.user = user

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp-1': {
                    'variations': {
                        'ui-change-v1': (0, 20),
                        'ui-change-v2': (20, 60),
                        'ui-change-v3': (60, 100)
                    },
                    'max-age': 604800
                },
                'exp-2': {
                    'variations': {
                        'backend-change-v1': (0, 50),
                        'novariation': (50, 100)
                    },
                    'max-age': 86400
                }
            }

            with patch('webcompat.helpers.random.random') as mock_random:
                mock_random.return_value = 0.4
                expected_experiments = {
                    'exp-1': 'ui-change-v2',
                    'exp-2': 'backend-change-v1'
                }
                self.assertEqual(
                    ab_current_experiments(), expected_experiments
                )

    def test_ab_init(self):
        """Check if ab_init sets the expected experiment cookie"""
        with webcompat.app.test_request_context(
                '/',
                method='GET') as ctx:

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp-1': {
                    'variations': {
                        'ui-change-v1': (0, 20),
                        'ui-change-v2': (20, 100)
                    },
                    'max-age': 604800
                }
            }

            with patch('webcompat.helpers.random.random') as mock_random:

                self.assertEqual(ctx.request.headers.get('Set-Cookie'), None)

                mock_random.return_value = 0.4
                response = self.app.get('/')

                exp_cookie_value = None
                for header in response.headers.getlist('Set-Cookie'):
                    cookie = parse_cookie(header)
                    value = cookie.get('exp-1')
                    if value:
                        exp_cookie_value = value

                self.assertEqual(exp_cookie_value, 'ui-change-v2')

    def test_ab_init_active(self):
        """Check if ab_init doesn't set cookies if experiment already active"""
        cookie = 'exp-1=ui-change-v1; Path=/'
        with webcompat.app.test_request_context(
                '/',
                method='GET',
                environ_base={'HTTP_COOKIE': cookie}):

            webcompat.app.config['AB_EXPERIMENTS'] = {
                'exp-1': {
                    'variations': {
                        'ui-change-v1': (0, 20),
                        'ui-change-v2': (20, 100)
                    },
                    'max-age': 604800
                }
            }

            response = self.app.get('/')
            response.set_cookie = Mock()

            ab_init(response)
            response.set_cookie.assert_not_called()

    def test_get_extra_labels(self):
        """Test extra_labels extraction from form object."""
        with webcompat.app.test_request_context('/issues/new', method='POST'):

            # need to call this since g.current_experiments
            # is defined in before_request
            webcompat.app.preprocess_request()

            self.assertEqual(get_extra_labels(
                {'extra_labels': '["type-marfeel", "browser-fenix"]'}),
                ['type-marfeel', 'browser-fenix']
            )

            self.assertEqual(get_extra_labels({}), [])
            self.assertEqual(get_extra_labels({'extra_labels': '[]'}), [])
            self.assertEqual(get_extra_labels({'extra_labels': ''}), [])

            session['extra_labels'] = ['type-fastclick']

            self.assertEqual(get_extra_labels(
                {'extra_labels': '["type-marfeel", "browser-fenix"]'}),
                ['type-fastclick']
            )

    def test_process_log_url(self):
        self.assertEqual(get_filename_from_url(
            'https://example.com/file.js'),
            'file.js'
        )
        self.assertEqual(get_filename_from_url(
            'https://example.com/vendor.min.js?201911131607%20line%202%20%3E%20#id'),  # noqa
            'vendor.min.js'
        )
        self.assertEqual(get_filename_from_url(
            'https://example.com/some_path/to_page/'
        ),
            'to_page'
        )

        self.assertEqual(get_filename_from_url(
            'https://example.com/some_path/to_page'
        ),
            'to_page'
        )

        self.assertEqual(get_filename_from_url(
            'https://example.com/'),
            'example.com'
        )
        self.assertEqual(get_filename_from_url(
            'https://example.com'),
            'example.com'
        )

    def test_is_darknet_domain(self):
        """Assert domains validity in issue reporting."""
        self.assertTrue(is_darknet_domain('www.gjobqjj7wyczbqie.onion'))
        self.assertFalse(is_darknet_domain('example.com'))
        self.assertFalse(is_darknet_domain('gjobqjj7wyczbqie.onion.com'))
        self.assertFalse(is_darknet_domain(None))

    def test_get_response_headers_tuple(self):
        """Test we get expected headers with a tuple argument."""
        proxy_response = (1, 1, {'lol': 'wat', 'etag': '1'})
        with webcompat.app.app_context():
            new_headers = get_response_headers(proxy_response)
            assert new_headers.get('content-type') == 'application/json'
            assert new_headers.get('etag') == '1'
            assert new_headers.get('lol') is None
            new_headers2 = get_response_headers(proxy_response,
                                                mime_type='text/html')
            assert new_headers2.get('content-type') == 'text/html'

    def test_get_response_headers_response(self):
        """Test we get expected headers with a Response argument."""
        proxy_response = Response()
        proxy_response.headers = {'lol': 'wat', 'etag': '1'}
        with webcompat.app.app_context():
            new_headers = get_response_headers(proxy_response)
            assert new_headers.get('content-type') == 'application/json'
            assert new_headers.get('etag') == '1'
            assert new_headers.get('lol') is None
            new_headers2 = get_response_headers(proxy_response,
                                                mime_type='text/html')
            assert new_headers2.get('content-type') == 'text/html'


if __name__ == '__main__':
    unittest.main()
