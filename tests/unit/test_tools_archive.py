#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Tests for webcompat.com archive tools.

TODO: test for json to html
TODO: test for getting the issue as json
TODO: test for getting the comments json
TODO: test for navigating paged comments
TODO: tests for an issue model
TODO: test if issue is locked (live, frozen flag)
TODO: test that an issue can be on a different repo
TODO: test that the issue fetching has failed
TODO: test that the issue comments fetching has failed
"""

import os

import pytest

from tools.archive import model

# TODO: Probably create a fixture with a real json loaded as dict
PAYLOAD = {
    'issue': {
        'number': 100,
        'title': 'tamala2010.example.org - A Punk Cat in Space'
    }
}


def get_fixture(filename):
    """Return the data fixture."""
    current_root = os.path.realpath(os.curdir)
    fixture_path = 'tests/fixtures/tools'
    path = os.path.join(current_root, fixture_path, filename)
    with open(path, 'r') as f:
        data = f.read()
    return data


def test_render_as_html():
    """Test the html rendering of an ArchivedIssue."""
    issue = model.ArchivedIssue.from_dict(PAYLOAD)
    archived_issue = get_fixture('issue_100.html')
    assert issue.as_html(template='archive') == archived_issue


def test_issue_init_from_dict():
    """Test we get the right set of data."""
    issue = model.Issue.from_dict(PAYLOAD)
    assert issue.number == 100
    assert issue.title == 'tamala2010.example.org - A Punk Cat in Space'
