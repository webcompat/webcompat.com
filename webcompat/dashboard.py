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
    control_date = get_control_date(48)
    for issue in milestone_list:
        # Working on labels
        labels = [label['name'] for label in issue['labels']]
        # browsers list
        browsers = browser_labels(labels)
        # flag for issues with status-needsinfo
        needsinfo = has_needsinfo(labels)
        # flag for issues which are older than 48h
        older = is_older(issue['created_at'], control_date)
        needstriage_list.append({
            'number': issue['number'],
            'title': issue['title'],
            'created_at': issue['created_at'],
            'updated_at': issue['updated_at'],
            'browsers': browsers,
            'needsinfo': needsinfo,
            'older': older})
    # Counting issues
    dashboard_stats = {}
    dashboard_stats['total'] = len(milestone_list)
    dashboard_stats['older'] = len([issue['older']
                                    for issue in needstriage_list
                                    if issue['older'] is True])
    dashboard_stats['needsinfo'] = len([issue['needsinfo']
                                        for issue in needstriage_list
                                        if issue['needsinfo'] is True])
    return needstriage_list, dashboard_stats


def has_needsinfo(labels):
    """Assess if the issue has a needsinfo label."""
    needsinfo = (label for label in labels
                 if label.startswith('status-needsinfo'))
    if next(needsinfo, False):
        return True
    return False


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
    older = False
    created = datetime.strptime(issue_date, "%Y-%m-%dT%H:%M:%SZ")
    if created < time_gap:
        older = True
    return older


def get_control_date(hours):
    """Return the date minus a certain number of hours."""
    return datetime.utcnow() - timedelta(hours=hours)
