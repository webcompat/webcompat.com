#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our URL endpoints."""

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
    """Test for routes in the the project."""

    def setUp(self):
        """Set up the tests."""
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_home(self):
        """Test that the home page exists."""
        rv = self.app.get('/', environ_base=headers)
        self.assertEqual(rv.status_code, 200)

    def test_new_issue(self):
        """Test that /issues/new exists."""
        rv = self.app.get('/issues/new', environ_base=headers)
        self.assertEqual(rv.status_code, 200)

    def test_about(self):
        """Test that /about exists."""
        rv = self.app.get('/about')
        self.assertEqual(rv.status_code, 200)

    def test_privacy(self):
        """Test that /privacy exists."""
        rv = self.app.get('/privacy')
        self.assertEqual(rv.status_code, 200)

    def test_contributors(self):
        """Test that /contributors exists."""
        rv = self.app.get('/contributors')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_report_bug(self):
        """Test that /contributors/report-bug exists."""
        rv = self.app.get('/contributors/report-bug')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_diagnose_bug(self):
        """Test that /contributors/diagnose-bug exists."""
        rv = self.app.get('/contributors/diagnose-bug')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_reproduce_bug(self):
        """Test that /contributors/reproduce-bug exists."""
        rv = self.app.get('/contributors/reproduce-bug')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_site_outreach(self):
        """Test that /contributors/site-outreach exists."""
        rv = self.app.get('/contributors/site-outreach')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_build_tools(self):
        """Test that /contributors/build-tools exists."""
        rv = self.app.get('/contributors/build-tools')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_web_research(self):
        """Test that /contributors/web-platform-research exists."""
        rv = self.app.get('/contributors/web-platform-research')
        self.assertEqual(rv.status_code, 200)

    def test_contributors_events(self):
        """Test that /contributors/organize-webcompat-events exists."""
        rv = self.app.get('/contributors/organize-webcompat-events')
        self.assertEqual(rv.status_code, 200)

    def test_contact(self):
        """Test that /contact exists."""
        rv = self.app.get('/contact')
        self.assertEqual(rv.status_code, 200)

    def test_contact(self):
        '''Test that /contact exists.'''
        rv = self.app.get('/contact')
        self.assertEqual(rv.status_code, 200)

    def test_activity_page_401_if_not_logged_in(self):
        """Test that asks user to log in before displaying activity."""
        rv = self.app.get('/me')
        self.assertEqual(rv.status_code, 401)

    def test_issue_int(self):
        """Test if issues are really integer.

        * an issue only displays if <number> is an integer
        * /issues/<number> exists, and does not redirect.
        """
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 404)
        rv = self.app.get('/issues/three')
        self.assertEqual(rv.status_code, 404)
        self.assertNotEqual(rv.status_code, 200)

    def test_issue_redirect(self):
        """Test that the /issues/<number> exists, and does not redirect."""
        rv = self.app.get('/issues/3')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 307)

    def test_issues_list_page(self):
        """Test that the /issues route gets 200 and does not redirect."""
        rv = self.app.get('/issues')
        self.assertEqual(rv.status_code, 200)
        self.assertNotEqual(rv.status_code, 307)

    def test_csp_report_uri(self):
        """Test POST to /csp-report w/ correct content-type returns 204."""
        headers = {'Content-Type': 'application/csp-report'}
        rv = self.app.post('/csp-report', headers=headers)
        self.assertEqual(rv.status_code, 204)

    def test_csp_report_uri_bad_content_type(self):
        """Test POST w/ wrong content-type to /csp-report returns 400."""
        headers = {'Content-Type': 'application/json'}
        rv = self.app.post('/csp-report', headers=headers)
        self.assertNotEqual(rv.status_code, 204)
        self.assertEqual(rv.status_code, 400)

    def test_tools_cssfixme(self):
        """Test that the /tools/cssfixme route gets 200."""
        rv = self.app.get('/tools/cssfixme')
        self.assertEqual(rv.status_code, 410)

    def test_rate_limit(self):
        """Rate Limit URI sends 410 Gone."""
        rv = self.app.get('/rate_limit')
        self.assertEqual(rv.status_code, 410)

    def test_missing_parameters_for_new_issue(self):
        """Sends 400 to POST on /issues/new with missing parameters."""
        rv = self.app.post('/issues/new', data=dict(url='foo'))
        self.assertEqual(rv.status_code, 400)

    def test_new_issue_should_not_crash(self):
        """/issues/new POST exit with 400 if missing parameters."""
        data = {'problem_category': u'mobile_site_bug',
                'description': u'foo',
                'submit-type': u'github-proxy-report',
                'url': u'http://example.com',
                'os': u'Foobar',
                'browser': u'BarFoo'}
        rv = self.app.post('/issues/new', data=data)
        self.assertEqual(rv.status_code, 400)

    def test_dashboard_triage(self):
        """Request to /dashboard/triage should be 200."""
        rv = self.app.get('/dashboard/triage')
        self.assertEqual(rv.status_code, 200)
        self.assertTrue('<h1>Triage Dashboard</h1>' in rv.data)
        self.assertTrue('text/html' in rv.content_type)

    def test_dashboard_route(self):
        """Request to /dashboard should be 404.

        For now, the dashboard route has no purpose.
        """
        rv = self.app.get('/dashboard/')
        content_test = 'Lost in Punk Cat Space (404)' in rv.data
        self.assertEqual(rv.status_code, 404)
        self.assertTrue('text/html' in rv.content_type)
        self.assertTrue(content_test)
        rv = self.app.get('/dashboard')
        content_test = 'Lost in Punk Cat Space (404)' in rv.data
        self.assertEqual(rv.status_code, 404)
        self.assertTrue('text/html' in rv.content_type)
        self.assertTrue(content_test)


if __name__ == '__main__':
    unittest.main()
