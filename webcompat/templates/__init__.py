#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Module where we register Jinja template filters."""

import hashlib
import os
import os.path
import re

from flask import Markup
from webcompat import app

STATIC_PATH = os.getcwd() + '/webcompat/static'

cache_dict = {}


@app.template_filter('bust_cache')
def bust_cache(file_path):
    """Jinja2 filter to add a cache busting param based on md5 checksum.

    Uses a simple cache_dict to we don't have to hash each file for every
    request. This is kept in-memory so it will be blown away when the app
    is restarted (which is when file changes would have been deployed).
    Doesn't return hash on development
    """
    if app.config['LOCALHOST']:
        return file_path
    trimmed_file_path = file_path
    if file_path.startswith('/'):
        trimmed_file_path = file_path[1:]
    absolute_path = os.path.join(STATIC_PATH, trimmed_file_path)
    return file_path + '?' + get_checksum(absolute_path)


def get_checksum(file_path):
    print('GET_CHECKSUM', cache_dict)
    try:
        checksum = cache_dict[file_path]
    except KeyError:
        checksum = md5_checksum(file_path)
        cache_dict[str(file_path)] = checksum
        print('GET_CHECKSUM (after cache miss)', cache_dict)
    return checksum


def md5_checksum(file_path):
    """Return the md5 checksum for a given file path."""
    try:
        with open(file_path, 'rb') as fh:
            m = hashlib.md5()
            while True:
                # only read in 8k of the file at a time
                data = fh.read(8192)
                if not data:
                    break
                m.update(data)
            checksum = m.hexdigest()
    except FileNotFoundError:
        # if file doesn't exist we want to be able to show it in the URI
        checksum = 'missing_file'
    finally:
        return checksum


@app.template_filter('format_date')
def format_date(datestring):
    """Convert a long iso date to the day date.

    input: 2014-05-01T02:26:28Z
    output: 2014-05-01
    """
    return datestring[0:10]


@app.template_filter('format_title')
def format_title(issue_data):
    """Format a more useful Issue title for use by the aside template."""
    issue_title = issue_data.get('title', '')
    domain = get_domain(issue_title)
    description = get_description(issue_data['body_html'])
    if description:
        issue_title = '{0} - {1}'.format(domain, description)
    return issue_title


def get_domain(title):
    """Get the 'domain name' from the title.

    In practice, this just grabs the first string before
    the first whitespace, because that's where we put the
    domain when we passed it to GitHub upon creation.
    """
    domain = re.search(r'^([^ ]+)', title)
    if domain:
        return domain.group(1)
    else:
        return ''


def get_description(body_html):
    """Get the description of the body by parsing its content.

    In cases where this fails (in case someone doesn't use the form, and
    files and issue directly on GitHub and edits the template), return
    something sensible.
    """
    stripped_body = Markup.striptags(body_html)
    description = re.search(r'Description: (.+) Steps', stripped_body)
    if description:
        return description.group(1)[0:74]
    else:
        return None


@app.template_filter('format_milestone_title')
def format_milestone_title(issue_data):
    """Get a more human-friendly description of the state + milestone."""
    milestone_map = {
        'contactready': 'Ready for Outreach',
        'duplicate': 'Duplicate',
        'incomplete': 'Incomplete',
        'fixed': 'Fixed',
        'invalid': 'Invalid',
        'needscontact': 'Needs Contact',
        'needsdiagnosis': 'Needs Diagnosis',
        'needstriage': 'Needs Triage',
        'non-compat': 'Non-Compat',
        'sitewait': 'Site Contacted',
        'wontfix': 'Won\'t Fix',
        'worksforme': 'Works For Me',
    }
    state = issue_data.get('state')
    milestone = issue_data.get('milestone')
    title = ''
    if milestone:
        title = milestone_map.get(issue_data['milestone'].get('title'),
                                  'Missing Milestone!')
    if state == 'closed':
        return 'Closed: {0}'.format(title)
    else:
        return title


@app.template_filter('format_milestone_class')
def format_milestone_class(issue_data):
    """Return the correct class for a milestone, depending on state."""
    state = issue_data.get('state')
    milestone = issue_data.get('milestone')
    title = ''
    if state == 'closed':
        return 'closed'
    elif milestone:
        title = milestone.get('title')
    return title
