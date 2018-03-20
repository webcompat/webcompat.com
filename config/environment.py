#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Generic configuration for the project."""

import os

# Define the application base directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
DATA_PATH = os.path.join(BASE_DIR, 'data')
# Add the data/ directory if it doesn't exist.
if not os.path.exists(DATA_PATH):
    os.makedirs(DATA_PATH)

# the PRODUCTION and DEVELOPMENT environment variables are set in uwsgi.conf
# on the webcompat server. If they're not set, they will default to None
PRODUCTION = os.environ.get('PRODUCTION')
# locally, we refer to this as STAGING
STAGING = os.environ.get('DEVELOPMENT')
# Are we serving the app from localhost?
LOCALHOST = not PRODUCTION and not STAGING

# BUG STATUS
# The id will be initialized when the app is started.
STATUSES = {
    u'needstriage': {'id': 0, 'order': 1, 'state': 'open'},
    u'needsdiagnosis': {'id': 0, 'order': 2, 'state': 'open'},
    u'needscontact': {'id': 0, 'order': 3, 'state': 'open'},
    u'contactready': {'id': 0, 'order': 4, 'state': 'open'},
    u'sitewait': {'id': 0, 'order': 5, 'state': 'open'},
    u'duplicate': {'id': 0, 'order': 1, 'state': 'closed'},
    u'fixed': {'id': 0, 'order': 2, 'state': 'closed'},
    u'incomplete': {'id': 0, 'order': 3, 'state': 'closed'},
    u'invalid': {'id': 0, 'order': 4, 'state': 'closed'},
    u'non-compat': {'id': 0, 'order': 5, 'state': 'closed'},
    u'wontfix': {'id': 0, 'order': 6, 'state': 'closed'},
    u'worksforme': {'id': 0, 'order': 7, 'state': 'closed'}
    }

# We don't need to compute for every requests.
OPEN_STATUSES = [status for status in STATUSES
                 if STATUSES[status]['state'] == 'open']
