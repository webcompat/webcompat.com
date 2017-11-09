#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Dashboard module.

Modules for helper function in dealing with /dashboard/ routes.
(for now only /dashboard/triage).
"""

from datetime import datetime
from datetime import timedelta


def filter_needstriage(milestone_list):
    """Filter out only the necessary data for the triage dashboard."""
    needstriage_list = []
    date48h = datetime.utcnow() - timedelta(hours=48)
    for issue in milestone_list:
        # Working on labels
        labels = [label['name'] for label in issue['labels']]
        # browsers list
        browsers = browser_labels(labels)
        # flag for issues with status-needinfo
        needinfo = has_needinfo(labels)
        # flag for issues which are older than 48h
        priority = is_older(issue['created_at'], date48h)
        needstriage_list.append({
            'number': issue['number'],
            'title': issue['title'],
            'created_at': issue['created_at'],
            'updated_at': issue['updated_at'],
            'browsers': browsers,
            'needinfo': needinfo,
            'priority': priority})
    # Counting issues
    total_count = len(milestone_list)
    priority_count = len([issue['priority']
                         for issue in needstriage_list
                         if issue['priority'] is True])
    return needstriage_list, total_count, priority_count


def has_needinfo(labels):
    """Assess if the issue has a needinfo label."""
    needinfo = False
    if 'status-needinfo' in labels:
        needinfo = True
    return needinfo


def browser_labels(labels):
    """Return a list of browser labels only without the `browser-`."""
    return [label[8:].encode('utf-8')
            for label in labels
            if label.startswith('browser-') and label[8:] is not '']


def is_older(issue_date, time_gap):
    """Assess if the issue is older than a defined time gap.

    Return True if the date is older.
    time_gap is defined as a datetime object.
    """
    priority = False
    created = datetime.strptime(issue_date, "%Y-%m-%dT%H:%M:%SZ")
    if created < time_gap:
        priority = True
    return priority
