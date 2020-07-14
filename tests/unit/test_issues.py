#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for issue creation."""

import json

import pytest
from unittest.mock import MagicMock
from unittest.mock import patch
from werkzeug.datastructures import MultiDict
from werkzeug.exceptions import BadRequest

from .test_api_urls import mock_api_response
import webcompat
from webcompat import app
from webcompat.issues import moderation_template
from webcompat.issues import report_issue
from webcompat.issues import report_private_issue
from webcompat.issues import report_public_issue

FORM = MultiDict([
    ('browser', 'Firefox 99.0'),
    ('description', 'sup'),
    ('details', ''),
    ('os', 'Mac OS X 13'),
    ('problem_category', 'unknown_bug'),
    ('submit_type', ''),
    ('url', 'http://3139.example.com'),
    ('username', ''), ])

FORM_ANON = FORM.copy()
FORM_ANON['submit_type'] = 'github-proxy-report'
FORM_AUTH = FORM.copy()
FORM_AUTH['submit_type'] = 'github-auth-report'


@pytest.fixture
def setup():
    """Test client for requests."""
    webcompat.app.config['TESTING'] = True


def test_report_with_auth_on(setup):
    """Test that we can still work with github-auth-report."""
    with patch('webcompat.issues.github.post') as json_resp:
        json_resp.return_value = {'number': 2}
        json_data = report_issue(FORM_AUTH, proxy=False)
        assert type(json_data) is dict
        assert json_data.get('number') == 2


def test_report_issue_returns_number(setup):
    """Test issue posting report the right json."""
    with patch('webcompat.issues.proxy_request') as github_data:
        github_data.return_value = mock_api_response({
            'status_code': 201,
            'content': '[{"number":2}]',
        })
        with patch('webcompat.issues.report_private_issue') as silent:
            # We avoid making a call to report_private_issue
            silent.return_value = None
            json_data = report_issue(FORM_ANON, proxy=True)
            assert type(json_data) is dict
            assert json_data.get('number') == 2


def test_report_issue_fails_400_for_unknown_type(setup):
    """Test request fails with a 400 because type unknown."""
    with pytest.raises(BadRequest):
        rv = report_issue(FORM, proxy=True)


def test_report_issue_fails_400_for_proxy(setup):
    """Test github-proxy-report fails with a 400."""
    with patch('webcompat.issues.proxy_request') as github_data:
        github_data.return_value = mock_api_response({
            'status_code': 400,
            'content': '[{"number":2}]',
        })
        with pytest.raises(BadRequest):
            rv = report_issue(FORM_ANON, proxy=True)


def test_report_private_issue_returns_nothing(setup):
    """Test that we get nothing back from a private issue report."""
    with patch('webcompat.issues.proxy_request') as github_data:
        github_data.return_value = mock_api_response({
            'status_code': 400,
            'content': '[{"number":2}]',
        })
        rv = report_private_issue(FORM_ANON, 'http://public.example.com')
        assert rv is None


def test_report_public_issue_returns_moderation_template(setup):
    """Test the data in report_public_issue contains the right data."""
    with patch('webcompat.issues.proxy_request') as req:
        req.return_value = mock_api_response({
            'status_code': 201,
            'content': '[{"number":2}]',
        })
        report_public_issue()
        args, kwargs = req.call_args
        post_data = json.loads(kwargs['data'])
        assert type(post_data) is dict
        assert 'title' in post_data.keys()
        assert 'body' in post_data.keys()
        assert 'labels' in post_data.keys()
        assert ['action-needsmoderation'] == post_data['labels']


def test_moderation_template(setup):
    """Check the moderation template structure.

    - must be a dictionary
    - must contain the keys: title, body
    """
    actual = moderation_template('ongoing')
    assert type(actual) is dict
    assert 'title' in actual.keys()
    assert 'body' in actual.keys()


def test_moderation_template_rejected(setup):
    """Check the return values are for the rejected case."""
    actual = moderation_template('rejected')
    assert actual['title'] == 'Issue rejected.'
    assert 'Its original content has been deleted' in actual['body']


def test_moderation_template_ongoing(setup):
    """Check the return values are for the needsmoderation case."""
    # test the default
    actual = moderation_template()
    assert actual['title'] == 'In the moderation queue.'
    assert 'put in the moderation queue.' in actual['body']
    # test the keyword
    actual = moderation_template('ongoing')
    assert actual['title'] == 'In the moderation queue.'
    assert 'put in the moderation queue.' in actual['body']
    # bad keyword, we go back to the default.
    actual = moderation_template('punkcat')
    assert actual['title'] == 'In the moderation queue.'
    assert 'put in the moderation queue.' in actual['body']
