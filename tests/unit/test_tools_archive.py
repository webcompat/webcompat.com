#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Tests for webcompat.com archive tools.

TODO: test for getting the comments json
TODO: test for navigating paged comments
TODO: test if issue is locked (live, frozen flag)
TODO: test that an issue can be on a different repo
TODO: test that the issue fetching has failed
TODO: test that the issue comments fetching has failed
"""

import json
import pathlib

import pytest
import requests
from requests import Response

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


def test_issue_init_from_dict(issue_100):
    """Test we get the right set of data."""
    assert issue_100.number == 100
    assert issue_100.title == 'tamala2010.example.org - A Punk Cat in Space'
    assert issue_100.comments_number == 0
    assert issue_100.comments_url == 'https://api.github.com/repos/webcompat/web-bugs/issues/100/comments'  # noqa


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
    fake_json = mocker.patch.object(model, 'recursive_fetch')
    fake_json.return_value = json.loads(get_fixture('1470-comments-all.json'))
    issue_1470.fetch_comments()
    # actual tests after fetching
    assert len(issue_1470.comments) == 41
    assert type(issue_1470.comments) == list
    assert type(issue_1470.comments[0]) == model.Comment


def test_comments_fetch_no_comments(issue_100):
    """Test the comments fetching without comments available."""
    # Before fetching the comments
    issue_100.fetch_comments()
    assert len(issue_100.comments) == 0


def test_make_request(mocker):
    fake_resp = mocker.patch.object(model.requests, 'get')
    fake_resp.return_value.status_code = 200
    actual = model.make_request('http://example.org/')
    assert actual.status_code == 200


@pytest.mark.skip(reason="TODO: HTTP ERROR log for comments fetching")
def test_http_error_log_comments_fetch():
    """Test that we record a log message for HTTP error when fetching."""
    pass


@pytest.mark.skip(reason="TODO: JSON for ALL comments")
def test_recursive_fetch():
    """Test that we receive a JSON of all comments."""
    pass


@pytest.mark.skip(reason="TODO: Test comment as list of Comment")
def test_comments_as_list():
    """Test comments json conversion to a list of Comment objects."""
    pass
