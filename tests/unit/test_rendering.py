#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our URI endpoints rendering."""

import pytest

import webcompat

# Any request that depends on parsing HTTP Headers (basically anything
# on the index route, will need to include the following: environ_base=headers
BROWSERS = {
    'chrome': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3425.0 Safari/537.36',  # noqa
        b'<span class="link-text">Download Chrome Add-on</span>'),
    'firefox': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:61.0) Gecko/20100101 Firefox/61.0',  # noqa
        b'<span class="link-text">Download Firefox Add-on</span>'),
    'firefox_mob': (
        'Mozilla/5.0 (Android; Mobile; rv:61.0) Gecko/61.0 Firefox/61.0',
        b'<span class="link-text">Download Firefox Add-on</span>'),
    'opera': (
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 OPR/15.0.1147.100',  # noqa
        b'<span class="link-text">Download Opera Add-on</span>'),
    'fake': (
        'Punk Cat Space',
        b'<span class="link-text">Give Feedback</span>'),
    }

HEADERS = {'HTTP_USER_AGENT': BROWSERS['firefox'][0]}


@pytest.fixture
def client():
    webcompat.app.config['TESTING'] = True
    with webcompat.app.test_client() as client:
        yield client


def login(client, username, password):
    """Create a call to the login page to initiate g."""
    return client.get('/login', data=dict(
        username=username,
        password=password
    ), follow_redirects=True)


def test_titles(client):
    """Page title format for different URIs."""
    issue_number = '396'
    default_title = 'Web Compatibility'
    website_uris = [
        ('/', 'Bug reporting for the web'),
        ('/about', 'About'),
        ('/contributors', 'Contributors'),
        ('/issues/' + issue_number, 'Issue #' + issue_number),
        ('/issues', 'Issues'),
        ('issues/new', 'New Issue'),
        ('/privacy', 'Privacy Policy'),
        ('/terms', 'Terms of Service'),
        ('/404', default_title)
    ]
    for uri, title in website_uris:
        rv = client.get(uri, environ_base=HEADERS)
        expected = '<title>{title} | webcompat.com</title>'.format(
            title=title)
        assert expected.encode('utf-8') in rv.data


def test_addon_link(client):
    """An addon link should be in the top navigation bar.

    This depends on the user agent string.
    """
    for browser in BROWSERS:
        browser_ua, expected = BROWSERS[browser]
        headers = {'HTTP_USER_AGENT': browser_ua}
        rv = client.get('/', environ_base=headers)
        assert expected in rv.data


def test_form_rendering(client):
    """Double Check that the form is properly populated."""
    url = '/issues/new?url=http://example.com/&label=type-stylo'
    rv = client.get(url, environ_base=HEADERS)
    assert b'Firefox 61.0' in rv.data
    assert b'Mac OS X 10.13' in rv.data
    assert b'http://example.com/' in rv.data


def test_wellknown_subpath(client):
    """Test that the /.wellknown/subpath route gets 404."""
    rv = client.get('/.well-known/test-route')
    assert rv.status_code == 404
    assert b'test-route' in rv.data


def test_wellknown_security(client):
    """Test that the /.wellknown/security.txt exists."""
    rv = client.get('/.well-known/security.txt')
    assert rv.status_code == 200
    assert b'Contact: mailto:kdubost+securitywebc' in rv.data
