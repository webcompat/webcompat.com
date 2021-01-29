#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for webcompat/templates/__init__.py."""

import pytest

import webcompat
from webcompat.templates import bust_cache
from webcompat.templates import cache_dict
from webcompat.templates import format_date
from webcompat.templates import format_milestone_class
from webcompat.templates import format_milestone_title
from webcompat.templates import format_title
from webcompat.templates import get_description
from webcompat.templates import get_checksum
from webcompat.templates import get_domain
from webcompat.templates import md5_checksum
from webcompat.templates import STATIC_PATH


def test_format_date():
    """Test date formatting.

    We trust what GitHub gives us, so just test length.
    input: 2014-05-01T02:26:28Z
    ouput: 2014-05-01
    """
    input = '2014-05-01T02:26:28Z'
    output = format_date(input)
    assert len(output) == 10
    assert 'T' not in output
    assert output == '2014-05-01'


def test_get_domain():
    """Test domain name extraction from title.

    (This really means give us the first pile of strings before
    the first whitespace).
    """
    title = 'staging.webcompat.com - site is not usable'
    assert get_domain(title) == 'staging.webcompat.com'
    title = '😎 😓'
    assert get_domain(title) == '😎'


def test_get_description():
    """Test that we can pull out the first part of the description."""
    body_html_frag = """
<p><strong>Problem type</strong>: Site is not usable<br>
<strong>Description</strong>: Missing items<br>
<strong>Steps to Reproduce</strong>:<br>
"""
    body_html_frag2 = '😎'
    assert get_description(body_html_frag) == 'Missing items'
    assert get_description(body_html_frag2) is None


def test_get_description_multiple_steps():
    """Test that we can pull out the first part of the description

    (with multiple 'Steps to reproduce' occurrences in text).
    """
    body_html_frag = """
<p><strong>Problem type</strong>: Site is not usable<br>
<strong>Description</strong>: Missing items<br>
<strong>Steps to Reproduce</strong>:<br>
Account created and signed in.
Steps to reproduce:
    Navigate to site
"""
    body_html_frag2 = '😎'
    assert get_description(body_html_frag) == 'Missing items'
    assert get_description(body_html_frag2) is None


def test_format_title():
    """Test putting issue titles together."""
    # title comes from body description
    issue_data = {
        'body_html': '\n'
        '<p><strong>Problem type</strong>: Site is not usable<br>\n'
        '<strong>Description</strong>: Desc from Description<br>\n'
        '<strong>Steps to Reproduce</strong>:<br>\n',
        'title': 'staging.webcompat.com - desc from title'}
    expected = 'staging.webcompat.com - Desc from Description'
    assert format_title(issue_data) == expected
    # title comes from issue title
    issue_data = {
        'body_html': 'fix my bug',
        'title': 'staging.webcompat.com - desc from title'}
    expected = 'staging.webcompat.com - desc from title'
    assert format_title(issue_data) == expected


def test_format_milestone_title():
    """Test that we return a properly formatted milestone title."""
    # missing milestone title
    issue_data = {'milestone': {'title': ''}, 'state': 'open'}
    expected = 'Missing Milestone!'
    assert format_milestone_title(issue_data) == expected
    # milestone has title
    issue_data = {'milestone': {'title': 'sitewait'}, 'state': 'open'}
    expected = 'Site Contacted'
    assert format_milestone_title(issue_data) == expected
    # milestone has title in a closed state
    issue_data = {'milestone': {'title': 'sitewait'}, 'state': 'closed'}
    expected = 'Closed: Site Contacted'
    assert format_milestone_title(issue_data) == expected


def test_format_milestone_class():
    """Test that we return the correct class string."""
    # open state
    issue_data = {
        'milestone': {'title': 'needsdiagnosis'},
        'state': 'open'}
    assert format_milestone_class(issue_data) == 'needsdiagnosis'
    # closed state
    issue_data = {
        'milestone': {'title': 'needsdiagnosis'},
        'state': 'closed'}
    assert format_milestone_class(issue_data) == 'closed'


def test_md5_checksum_file_missing():
    """Test checksum computation."""
    assert md5_checksum('/punkcat/nowhere') == 'missing_file'


def test_md5_checksum_file_exists(tmp_path):
    """Test checksum computation."""
    file_path = tmp_path / 'space.js'
    file_path.write_text('punkcat')
    assert md5_checksum(file_path) == '501753e94c8bfbbbd53c792c9688c8b5'


def test_get_checksum_not_in_cache(tmp_path):
    """Test the checksum cache_dict."""
    assert cache_dict == {}
    file_path = tmp_path / 'space.js'
    file_path.write_text('punkcat')
    get_checksum(file_path)
    assert str(file_path) in cache_dict


def test_bust_cache_localhost():
    """Test for LOCALHOST the path is not modified."""
    expected = '/dist/vendor.js'
    webcompat.app.config['LOCALHOST'] = True
    assert bust_cache('/dist/vendor.js') == expected


def test_bust_cache_production_missing_file():
    """Test for cache_bust the path is missing."""
    expected = '/punkcat/nowhere?missing_file'
    expected2 = 'punkcat/nowhere?missing_file'
    webcompat.app.config['LOCALHOST'] = None
    assert bust_cache('/punkcat/nowhere') == expected
    assert bust_cache('punkcat/nowhere') == expected2


def test_bust_cache_production_file_exists(tmpdir):
    """Test cache_bust with the right checksum."""
    webcompat.app.config['LOCALHOST'] = None
    webcompat.templates.STATIC_PATH = tmpdir
    file_path = tmpdir.join('space.js')
    file_path.write_text('punkcat', encoding='utf-8')
    expected = 'space.js' + '?501753e94c8bfbbbd53c792c9688c8b5'
    expected2 = '/space.js' + '?501753e94c8bfbbbd53c792c9688c8b5'
    assert bust_cache('space.js') == expected
    assert bust_cache('/space.js') == expected2
