#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Tests for webcompat.com archive tools.

TODO: define what data we need for the content of the template.
"""

import datetime
import json
import logging
import pathlib

import pytest
import requests
from requests.exceptions import HTTPError

from tools.archive import model


def get_fixture(filename):
    """Return the data fixture."""
    current_root = pathlib.Path('.').resolve()
    fixture_root = current_root / 'tests' / 'fixtures' / 'tools'
    fixture_path = fixture_root / filename
    return fixture_path.read_text()


def issue_init(issue_number):
    """Initialize the issue."""
    PAYLOAD = json.loads(get_fixture(f'{issue_number}.json'))
    return model.ArchivedIssue.from_dict(PAYLOAD)


@pytest.fixture
def issue_100():
    """Return issue 100."""
    return issue_init(100)


@pytest.fixture
def issue_1470():
    """Return issue 1470."""
    return issue_init(1470)


def test_render_as_html(issue_100):
    """Test the html rendering of an ArchivedIssue."""
    archived_issue = get_fixture('issue_100.html')
    assert issue_100.as_html(template='archive') == archived_issue


def test_render_as_html_with_comments(mocker, issue_1470):
    """Test the html rendering of an ArchivedIssue with comments."""
    archived_issue = get_fixture('issue_1470.html')
    fake_json = mocker.patch.object(model.Issue, 'recursive_fetch')
    fake_json.return_value = json.loads(get_fixture('1470-comments-all.json'))
    assert issue_1470.as_html(template='archive') == archived_issue


def test_issue_init_from_dict(issue_100):
    """Test we get the right set of data."""
    assert issue_100.number == 100
    assert issue_100.title == 'asd'
    assert issue_100.comments_number == 0
    assert issue_100.comments_url == 'https://api.github.com/repos/webcompat/web-bugs/issues/100/comments'  # noqa
    assert not issue_100.locked


def test_issue_archived_header():
    """Test that the page has an archived notice."""
    archive_msg = 'This issue has been archived. It is now read-only.'
    archived_issue = get_fixture('issue_100.html')
    assert archive_msg in archived_issue


def test_issue_links_to_home():
    """Test that the template has a link to the home page."""
    archived_issue = get_fixture('issue_100.html')
    assert '<a href="/" title="Navigate to main page."' in archived_issue


def test_save_issue_in_file(tmp_path, issue_100):
    """Test that we saved the issue in a static folder."""
    # Create a temporary Path object for testing
    tmp_root = tmp_path
    expected_location = tmp_root / 'static' / 'issue' / 'issue-100.html'
    expected_archived = get_fixture('issue_100.html')
    # Test it returns the full path to the issue
    location = issue_100.save(root_dir_path=tmp_root)
    assert type(location) == pathlib.PosixPath
    assert expected_location == location
    # Test it has written the correct content
    assert expected_archived == location.read_text()


def test_issue_has_no_comments_default(issue_100):
    """Test that an issue has no comments per default."""
    assert not issue_100.has_comments()


def test_issue_has_comments(issue_1470):
    """Test that an issue has comments."""
    assert issue_1470.has_comments()
    assert issue_1470.comments_number == 41


def test_comments_fetch(mocker, issue_1470):
    """Test the comments fetching.

    return a list of dictionary, each dictionary represents a comment.
    """
    # Before fetching the comments
    assert type(issue_1470.comments) == list
    assert len(issue_1470.comments) == 0
    # Instead of fetching from the network, we get a fixture
    fake_json = mocker.patch.object(model.Issue, 'recursive_fetch')
    fake_json.return_value = json.loads(get_fixture('1470-comments-all.json'))
    issue_1470.fetch_comments()
    # actual tests after fetching
    assert len(issue_1470.comments) == 41
    assert type(issue_1470.comments) == list
    assert type(issue_1470.comments[0]) == model.Comment
    comment_0 = issue_1470.comments[0]
    assert comment_0.author == 'karlcow'
    assert 'ok. Thanks a lot' in comment_0.body
    d = datetime.datetime(2015, 7, 28, 9, 25, 3, tzinfo=datetime.timezone.utc)
    assert comment_0.created_at == d
    assert comment_0.updated_at == d


def test_comments_get(mocker, issue_1470):
    """Test the comments fetching."""
    expected_links = {'next': {'url': 'https://api.github.com/repositories/17914657/issues/1470/comments?page=2', 'rel': 'next'}, 'last': {'url': 'https://api.github.com/repositories/17914657/issues/1470/comments?page=2', 'rel': 'last'}}  # noqa
    fake_r = mocker.patch.object(model.requests, 'get', autospec=True)
    fake_r.return_value.json.return_value = json.loads(get_fixture('1470-comments.json'))  # noqa
    fake_r.return_value.links = expected_links
    comments, links = issue_1470.get_comments('https://api.github.com/repos/webcompat/web-bugs/issues/1470/comments')  # noqa
    assert type(links) == dict
    assert links == {'next': {'url': 'https://api.github.com/repositories/17914657/issues/1470/comments?page=2', 'rel': 'next'}, 'last': {'url': 'https://api.github.com/repositories/17914657/issues/1470/comments?page=2', 'rel': 'last'}}  # noqa
    assert type(comments) == list
    assert comments == json.loads(get_fixture('1470-comments.json'))  # noqa


def test_comments_fetch_no_comments(issue_100):
    """Test the comments fetching without comments available."""
    # Before fetching the comments
    issue_100.fetch_comments()
    assert len(issue_100.comments) == 0


def test_http_error_log_comments_fetch(mocker, caplog, issue_1470):
    """Test that we record a log message for HTTP error when fetching."""
    fake_r = mocker.patch.object(model.requests, 'get')
    fake_r.side_effect = HTTPError()
    fake_r.status_code = 400
    caplog.set_level(logging.WARNING)
    issue_1470.get_comments('https://example.org/')
    assert 'Fetching comments failed' in caplog.text


@pytest.mark.skip(reason="TODO: JSON for ALL comments")
def test_recursive_fetch(mocker):
    """Test that we receive a JSON of all comments."""
    # This a recursive function which is probably hard to test.
    pass


def test_to_datetime():
    """convert date string to datetime object."""
    expected_date = datetime.datetime(2020, 8, 14, 12, 34, 56,
                                      tzinfo=datetime.timezone.utc)
    assert model.to_datetime('2020-08-14T12:34:56Z') == expected_date
