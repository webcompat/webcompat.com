#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for our API helper methods."""

import pytest

import webcompat
from webcompat.api.helpers import get_html_comments


@pytest.fixture
def setup():
    webcompat.app.config['TESTING'] = True


def get_single_comment_response(status_code):
    """Helper to return a single comment with status_code."""
    if status_code == 304:
        return (b'', 304, {'content-type': 'application/json'})
    return (b'{"user": {"login": "miketaylr","avatar_url": "https://avatars1.githubusercontent.com/u/67283?v=4"},"created_at": "2016-07-28T14:41:43Z","body_html": "<p>test</p>"}',  # noqa
        status_code, {'content-type': 'application/json'})


def test_get_html_comments_single_comment():
    """Test we get a template returned for a single comment."""
    with webcompat.app.app_context():
        for status in (200, 201, 404, 500):
            rv = get_html_comments(get_single_comment_response(status))
            assert b'<p>test</p>' in rv.data
            assert rv.status_code == status
            assert rv.content_type == 'text/html'
        rv = get_html_comments(get_single_comment_response(304))
        assert b'' in rv.data
        assert rv.status_code == 304
        assert rv.content_type == 'text/html'


def test_get_html_comments_multi_comment():
    """Test we get a template returned for multiple comments."""
    response = (b"""[
        {"user": {"login": "miketaylr","avatar_url": "https://avatars1.githubusercontent.com/u/67283?v=4"},"created_at": "2016-07-28T14:41:43Z","body_html": "<p>one</p>"},
        {"user": {"login": "miketaylr","avatar_url": "https://avatars1.githubusercontent.com/u/67283?v=4"},"created_at": "2016-07-28T14:42:43Z","body_html": "<p>two</p>"}]""",  # noqa
        200, {'content-type': 'application/json'})
    with webcompat.app.app_context():
        rv = get_html_comments(response)
        assert b'<p>one</p>' in rv.data
        assert b'<p>two</p>' in rv.data
        assert rv.status_code == 200
        assert rv.content_type == 'text/html'
