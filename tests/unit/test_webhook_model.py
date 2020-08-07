#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for webhooks.model.WebHookIssue methods."""

from dataclasses import asdict
import json
from unittest.mock import patch

import pytest
from requests.exceptions import HTTPError
from requests.models import Response

import webcompat
from tests.unit.test_webhook import event_data
from webcompat.webhooks.model import WebHookIssue

issue_info1 = {
    'action': 'opened', 'state': 'open', 'milestoned_with': '',
    'milestone': '', 'body': '<!-- @browser: Firefox 55.0 -->\n<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) Gecko/20100101 Firefox/55.0 -->\n<!-- @reported_with: web -->\n<!-- @public_url: https://github.com/webcompat/webcompat-tests/issues/1  -->\n\n**URL**: https://www.netflix.com/',   # noqa
    'domain': 'www.netflix.com', 'number': 600,
    'original_labels': ['action-needsmoderation'],
    'public_url': 'https://github.com/webcompat/webcompat-tests/issues/1',
    'repository_url': 'https://api.github.com/repos/webcompat/webcompat-tests-private',  # noqa
    'title': 'www.netflix.com - test valid event'}

issue_info2 = {
    'action': 'milestoned', 'state': 'open', 'milestoned_with': 'accepted',
    'milestone': 'accepted', 'body': '<!-- @browser: Firefox 55.0 -->\n<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) Gecko/20100101 Firefox/55.0 -->\n<!-- @reported_with: web -->\n<!-- @public_url: https://github.com/webcompat/webcompat-tests/issues/1  -->\n\n**URL**: https://www.netflix.com/',  # noqa
    'domain': 'www.netflix.com', 'number': 600,
    'original_labels': ['action-needsmoderation'],
    'public_url': 'https://github.com/webcompat/webcompat-tests/issues/1',
    'repository_url': 'https://api.github.com/repos/webcompat/webcompat-tests-private',  # noqa
    'title': 'www.netflix.com - test private issue accepted'}


def test_model_instance():
    """Test initializing a WebHookIssue model instance:

    1. from a private new issue
    2. from a milestoned issue
    """
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    expected = issue_info1
    assert expected == asdict(issue)

    json_event, signature = event_data('private_milestone_accepted.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    expected = issue_info2
    assert expected == asdict(issue)


@patch('webcompat.webhooks.model.make_request')
def test_close_private_issue(mock_mr):
    """Test issue state and API request that is sent to GitHub."""
    mock_mr.return_value.status_code == 200
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    issue.close_private_issue()
    method, uri, data = mock_mr.call_args[0]
    # make sure our issue state is what we expect
    assert issue.state == 'closed'
    # make sure we sent a patch with the right data to GitHub
    assert method == 'patch'
    assert 'state' in data


@patch('webcompat.webhooks.model.make_request')
def test_close_private_issue_fails(mock_mr):
    """Test issue state after a simulated GitHub failure."""
    mock_mr.side_effect = HTTPError()
    mock_mr.status_code = 400
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    with pytest.raises(HTTPError):
        issue.close_private_issue()
    assert issue.state == 'open'


@patch('webcompat.webhooks.model.make_request')
def test_comment_public_uri(mock_mr):
    """Test issue state and API request that is sent to GitHub."""
    mock_mr.return_value.status_code == 200
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    issue.comment_public_uri()
    method, uri, data = mock_mr.call_args[0]
    # make sure we sent a post with the right data to GitHub
    assert method == 'post'
    assert 'body' in data
    assert str(issue.number) in uri


@patch('webcompat.webhooks.model.make_request')
def test_moderate_public_issue(mock_mr):
    """Test issue state and API request that is sent to GitHub."""
    mock_mr.return_value.status_code == 200
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    issue.moderate_private_issue()
    method, uri, data = mock_mr.call_args[0]
    # make sure we sent a patch with the right data to GitHub
    assert method == 'patch'
    assert 'title' in data
    assert 'body' in data
    assert 'labels' in data
    assert issue.get_public_issue_number() in uri


@patch('webcompat.webhooks.model.make_request')
def test_reject_private_issue(mock_mr):
    """Test issue state and API request that is sent to GitHub."""
    mock_mr.return_value.status_code == 200
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    issue.reject_private_issue()
    method, uri, data = mock_mr.call_args[0]
    # make sure we sent a patch with the right data to GitHub
    assert method == 'patch'
    assert type(data) == dict
    assert issue.get_public_issue_number() in uri


def test_prepare_public_comment():
    """Test we prepare the right comment body."""
    expected_payload = '{"body": "[Original issue 1](https://github.com/webcompat/webcompat-tests/issues/1)"}'  # noqa
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    assert issue.prepare_public_comment() == json.loads(
        expected_payload).get('body')


def test_get_public_issue_number():
    """Test the extraction of the issue number from the public_url."""
    json_event, signature = event_data('private_issue_opened.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    assert issue.get_public_issue_number() == '1'


@patch('webcompat.webhooks.model.make_request')
def test_tag_as_public(mock_mr):
    """Test tagging an issue as public."""
    mock_mr.return_value.status_code == 200
    json_event, signature = event_data('new_event_valid.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    issue.tag_as_public()
    # make sure we modified the issue milestone property
    assert issue.milestone == 1
    method, uri, data = mock_mr.call_args[0]
    # make sure we sent a patch with the right data to GitHub
    assert method == 'patch'
    assert type(data) == dict
    assert 'labels' in data
    assert 'milestone' in data


@patch('webcompat.webhooks.helpers.extract_priority_label')
def test_prepare_accepted_issue(mock_priority):
    """Test the payload preparation for accepted moderated issues.

    Labels extraction will create a call to the topsites db
    and return a value. If the db has not been populated, the result
    will be different. So we return a value 'priority-critical' here.
    """
    mock_priority.return_value = 'priority-critical'
    json_event, signature = event_data('private_milestone_accepted.json')
    payload = json.loads(json_event)
    issue = WebHookIssue.from_dict(payload)
    actual = issue.prepare_accepted_issue()
    expected = {
        'body': '<!-- @browser: Firefox 55.0 -->\n'
        '<!-- @ua_header: Mozilla/5.0 (X11; Linux x86_64; rv:55.0) '
        'Gecko/20100101 Firefox/55.0 -->\n'
        '<!-- @reported_with: web -->\n'
        '<!-- @public_url: '
        'https://github.com/webcompat/webcompat-tests/issues/1  -->\n'
        '\n'
        '**URL**: https://www.netflix.com/',
        'labels': ['browser-firefox', 'priority-critical', 'engine-gecko'],
        'title': 'www.netflix.com - test private issue accepted'}
    assert expected == actual
