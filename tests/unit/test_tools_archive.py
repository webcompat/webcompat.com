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


def get_fixture(filename):
    """Return the data fixture."""
    current_root = os.path.realpath(os.curdir)
    fixture_path = 'tests/fixtures/tools'
    path = os.path.join(current_root, fixture_path, filename)
    with open(path, 'r') as f:
        data = f.read()
    return data


def test_issue_number_is_positive_integer():
    """Test initial values of the Issue object."""
    with pytest.raises(ValueError) as ex_info:
        model.Issue(-1)
    assert str(ex_info.value) == 'Issue number can only be positive'
    issue = model.Issue(100)
    assert type(issue.number) is int


def test_save_as_html():
    """Test the html rendering of an Issue."""
    issue = model.Issue(100)
    archived_issue = get_fixture('issue_100.html')
    assert issue.as_html(template='archive') == archived_issue
