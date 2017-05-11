#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for our URL endpoints.'''

import os.path
import sys
import unittest

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat  # nopep8

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
headers = {'HTTP_USER_AGENT': ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; '
                               'rv:31.0) Gecko/20100101 Firefox/31.0')}


class TestURLs(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_home(self):
        '''Test that the home page exists.'''
        rv = self.app.get('/', environ_base=headers)
        self.assertEqual(rv.status_code, 200)

    def test_new_issue(self):
        '''Test that /issues/new exists.'''
        rv = self.app.get('/issues/new', environ_base=headers)
        self.assertEqual(rv.status_code, 200)

    def test_about(self):
        '''Test that /about exists.'''
        rv = self.app.get('/about')
        self.assertEqual(rv.status_code, 200)

    def test_privacy(self):
        '''Test that /privacy exists.'''
        rv = self.app.get('/privacy')
        self.assertEqual(rv.status_code, 200)

    def test_login(self):
        '''Test that the /login route 302s to GitHub.'''
        rv = self.app.get('/login')
        self.assertEqual(rv.status_code, 302)
        self.assertIn('github.com/login/oauth/', rv.headers['Location'])

    def test_activity_page_401_if_not_logged_in(self):
        '''Test that asks user to log in before displaying activity.'''
        rv = self.app.get('/me')
        self.assertEqual(rv.status_code, 401)

    def test_issue_int(self):
        '''Test issues and integer for:

        * an issue only displays if <number> is an integer
        * /issues/<number> exists, and does not redirect.
        '''
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 404)
        rv = self.app.get('/issues/three')
        self.assertEqual(rv.status_code, 404)
        self.assertNotEqual(rv.status_code, 200)

    def test_issue_redirect(self):
        '''Test that the /issues/<number> exists, and does not redirect.'''
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 307)

    def test_issues_list_page(self):
        '''Test that the /issues route gets 200 and does not redirect.'''
        rv = self.app.get('/issues')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 307)

    def test_labeler_webhook(self):
        '''Webhook related tests.'''
        headers = {'X-GitHub-Event': 'ping'}
        rv = self.app.get('/webhooks/labeler', headers=headers)
        self.assertEqual(rv.status_code, 403)
        rv = self.app.post('/webhooks/labeler', headers=headers)
        # A random post should 401, only requests from GitHub will 200
        self.assertEqual(rv.status_code, 401)

    def test_csp_report_uri(self):
        '''Test POST to /csp-report w/ correct content-type returns 204.'''
        headers = {'Content-Type': 'application/csp-report'}
        rv = self.app.post('/csp-report', headers=headers)
        self.assertEqual(rv.status_code, 204)

    def test_csp_report_uri_bad_content_type(self):
        '''Test POST w/ wrong content-type to /csp-report returns 400.'''
        headers = {'Content-Type': 'application/json'}
        rv = self.app.post('/csp-report', headers=headers)
        self.assertNotEqual(rv.status_code, 204)
        self.assertEqual(rv.status_code, 400)

    def test_tools_cssfixme(self):
        '''Test that the /tools/cssfixme route gets 200.'''
        rv = self.app.get('/tools/cssfixme')
        self.assertEqual(rv.status_code, 200)

    def test_rate_limit(self):
        '''Rate Limit URI sends 410 Gone.'''
        rv = self.app.get('/rate_limit')
        self.assertEqual(rv.status_code, 410)

    def test_tools_cssfixme_with_URL(self):
        '''Test that the /tools/cssfixme route gets 200 with ?url query.'''
        url = '/tools/cssfixme?url=https://webcompat.com/css/webcompat.min.css'
        rv = self.app.get(url)
        self.assertEqual(rv.status_code, 200)

    def test_tools_cssfixme_with_nonsense_URL(self):
        '''Test that the /tools/cssfixme route gets 200 with bad ?url query.'''
        rv = self.app.get('/tools/cssfixme?url=foobar')
        self.assertEqual(rv.status_code, 200)

    def test_missing_parameters_for_new_issue(self):
        '''Sends 400 to POST on /issues/new with missing parameters.'''
        rv = self.app.post('/issues/new', data=dict(url='foo'))
        self.assertEqual(rv.status_code, 400)

    def test_new_issue_should_not_crash(self):
        '''Checks 500 is not accepted for /issues/new POST.'''
        data = {'problem_category': u'mobile_site_bug',
                'username': u'',
                'description': u'foo',
                'submit-type': u'github-proxy-report',
                'url': u'http://example.com',
                'os': u'Foobar',
                'browser': u'BarFoo'}
        rv = self.app.post('/issues/new', data=data)
        self.assertNotEqual(rv.status_code, 500)


if __name__ == '__main__':
    unittest.main()
