#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our API URL endpoints."""

import json
import unittest

from mock import MagicMock
from mock import patch
from requests import Response
from requests.structures import CaseInsensitiveDict

import webcompat

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0'),
           'HTTP_ACCEPT': 'application/json'}


def mock_api_response(response_config={}):
    """Create a mock response from the Github API."""
    headers = {
        'ETag': 'W/"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Content-Type': 'application/json; charset=utf-8'
    }
    api_response = MagicMock(spec=Response)
    api_response.content_type = 'application/json'
    for k, v in response_config.iteritems():
        if k == 'headers':
            headers.update(v)
        setattr(api_response, k, v)
    # Request headers are case insensitive dicts,
    # so we need to turn our mock headers into one.
    api_response.headers = CaseInsensitiveDict(headers)
    return api_response


class TestAPIURLs(unittest.TestCase):
    """Tests for all API URLs."""

    def setUp(self):
        """Set up tests."""
        # Switch to False here because we don't want to send the mocked
        # Fixture data.
        webcompat.app.config['TESTING'] = False
        self.app = webcompat.app.test_client()

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_api_issues_search(self):
        '''API issue search with bad keywords returns JSON 404.'''
        rv = self.app.get('/api/issues/search/foobar', environ_base=headers)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')

    def test_api_issues_out_of_range(self):
        """API issue for a non existent number returns JSON 404."""
        with patch('webcompat.helpers.proxy_request') as github_data:
            github_data.return_value = mock_api_response({
                'status_code': 404,
                'content': '[{"message":"Not Found","documentation_url":"https://developer.github.com/v3"}]'  # nopep8
            })
            rv = self.app.get('/api/issues/1', environ_base=headers)
            json_body = json.loads(rv.data)
            self.assertEqual(rv.status_code, 404)
            self.assertEqual(rv.content_type, 'application/json')
            self.assertEqual(json_body['status'], 404)

    def test_api_wrong_route(self):
        """API with wrong route returns JSON 404."""
        rv = self.app.get('/api/foobar', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)

    def test_api_wrong_category(self):
        """API with wrong category returns JSON 404."""
        rv = self.app.get('/api/issues/category/foobar', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)

    def test_api_labels_without_auth(self):
        """API access to labels without auth returns JSON 200."""
        with patch('webcompat.helpers.proxy_request') as github_data:
            github_data.return_value = mock_api_response(
                {'status_code': 200, 'content': '[]'})
            rv = self.app.get('/api/issues/labels', environ_base=headers)
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'application/json')

    def test_api_comments_link_header_auth(self):
        """Pagination in comments Link response header.

        API access to comments greater than 30 returns HTTP Link
        in the response header.
        """
        with patch('webcompat.helpers.proxy_request') as github_data:
            # Create mock data. One api_response for each call.
            github_data.side_effect = [
                mock_api_response({
                    'status_code': 200,
                    'content': '[]',
                    'headers': {
                        'Link': '<https://api.github.com/repositories/17839063/issues/398/comments?page=2>; rel="next", <https://api.github.com/repositories/17839063/issues/398/comments?page=4>; rel="last"',  # nopep8
                    },
                }),
                mock_api_response({'status_code': 200, 'content': '[]'})
            ]
            rv = self.app.get('/api/issues/398/comments', environ_base=headers)
            self.assertTrue(
                'link' in rv.headers and all(
                    x in rv.headers.get('link') for x in [
                        'page', 'next', 'last']))
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'application/json')
            # API access to comments for an issue
            # with < 30 does not return link a header in
            #  the response (until GitHub changes it....?)
            rv = self.app.get('/api/issues/4/comments', environ_base=headers)
            self.assertTrue('link' not in rv.headers)
            self.assertEqual(rv.status_code, 200)
            self.assertEqual(rv.content_type, 'application/json')

    def test_api_set_labels_without_auth(self):
        """API setting labels without auth returns JSON 403 error code."""
        rv = self.app.post('/api/issues/1/labels',
                           environ_base=headers, data='[]')
        self.assertEqual(rv.status_code, 403)

    def test_api_user_activity_without_auth(self):
        """API access to user activity without auth returns JSON 401."""
        rv = self.app.get('/api/issues/miketaylr/creator',
                          environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 401)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 401)

    def test_api_search_wrong_parameter(self):
        """API with wrong parameter returns JSON 404."""
        rv = self.app.get('/api/issues/search?z=foobar', environ_base=headers)
        json_body = json.loads(rv.data)
        self.assertEqual(rv.status_code, 404)
        self.assertEqual(rv.content_type, 'application/json')
        self.assertEqual(json_body['status'], 404)


if __name__ == '__main__':
    unittest.main()
