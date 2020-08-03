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

from tools.archive import model


def get_fixture(filename):
    """Return the data fixture."""
    current_root = pathlib.Path('.').resolve()
    fixture_root = current_root / 'tests' / 'fixtures' / 'tools'
    fixture_path = fixture_root / filename
    return fixture_path.read_text()


def test_render_as_html():
    """Test the html rendering of an ArchivedIssue."""
    PAYLOAD_100 = json.loads(get_fixture('100.json'))
    issue = model.ArchivedIssue.from_dict(PAYLOAD_100)
    archived_issue = get_fixture('issue_100.html')
    assert issue.as_html(template='archive') == archived_issue


def test_issue_init_from_dict():
    """Test we get the right set of data."""
    PAYLOAD_100 = json.loads(get_fixture('100.json'))
    issue = model.Issue.from_dict(PAYLOAD_100)
    assert issue.number == 100
    assert issue.title == 'tamala2010.example.org - A Punk Cat in Space'
    assert issue.comments_number == 0
    assert issue.comments_url == 'https://api.github.com/repos/webcompat/web-bugs/issues/100/comments'  # noqa


def test_issue_archived_header():
    """Test that the page has an archived notice."""
    archive_msg = 'This issue has been archived. It is now read-only.'
    archived_issue = get_fixture('issue_100.html')
    assert archive_msg in archived_issue


def test_issue_links_to_home():
    """Test that the template has a link to the home page."""
    archived_issue = get_fixture('issue_100.html')
    assert '<a href="/" title="Navigate to main page."' in archived_issue


def test_save_issue_in_file(tmp_path):
    """Test that we saved the issue in a static folder."""
    # Create a temporary Path object for testing
    tmp_root = tmp_path
    expected_location = tmp_root / 'static' / 'issue' / 'issue-100.html'
    expected_archived = get_fixture('issue_100.html')
    # Initialize the issue
    PAYLOAD_100 = json.loads(get_fixture('100.json'))
    issue = model.ArchivedIssue.from_dict(PAYLOAD_100)
    # Test it returns the full path to the issue
    location = issue.save(root_dir_path=tmp_root)
    assert type(location) == pathlib.PosixPath
    assert expected_location == location
    # Test it has written the correct content
    assert expected_archived == location.read_text()


def test_issue_has_no_comments_default():
    """Test that an issue has no comments per default."""
    PAYLOAD_100 = json.loads(get_fixture('100.json'))
    issue = model.Issue.from_dict(PAYLOAD_100)
    assert not issue.has_comments()


def test_issue_has_comments():
    """Test that an issue has comments."""
    PAYLOAD_40000 = json.loads(get_fixture('40000.json'))
    issue = model.Issue.from_dict(PAYLOAD_40000)
    assert issue.has_comments()


def test_comments_fetch():
    """Test the comments fetching.

    Once the issue has been instantiated, we could go fetch the comments
    only if requested: `issue.fetch_comments(page=1)`
    maybe we need `page=1` as a default parameters
    and a special `page=all` for everything.

    What is happening if the fetching fails totally? partially?
    the comments_number could be handy for checking we fetched
    all comments.

    Should there be a model for one Comment as we do for issues?

    On Issue probably we need something like.
      `comments: List[Comment] = field(default_factory=create_comments_list)`

    return a list of dictionary, each dictionary represents a comment.
    """
    # Initialization
    PAYLOAD_40000 = json.loads(get_fixture('40000.json'))
    issue = issue = model.Issue.from_dict(PAYLOAD_40000)
    # Before fetching the comments
    assert type(issue.comments) == list
    assert len(issue.comments) == 0
    # Fetching the comments
    # TODO: mockup the http request for the test suite.
    # TODO: save a fixture for a json comment file
    issue.fetch_comments()
    assert len(issue.comments) == 1
