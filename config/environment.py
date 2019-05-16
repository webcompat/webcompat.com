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

if PRODUCTION:
    GITHUB_CLIENT_ID = os.environ.get('PROD_GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('PROD_GITHUB_CLIENT_SECRET')
    GITHUB_CALLBACK_URL = os.environ.get('PROD_GITHUB_CALLBACK_URL')
    HOOK_SECRET_KEY = os.environ.get('HOOK_SECRET_KEY')
    ISSUES_REPO_URI = 'webcompat/web-bugs/issues'
    OAUTH_TOKEN = os.environ.get('PROD_OAUTH_TOKEN')
    SECRET_KEY = os.environ.get('PROD_SECRET_KEY')
    UPLOADS_DEFAULT_DEST = os.environ.get('PROD_UPLOADS_DEFAULT_DEST')
    UPLOADS_DEFAULT_URL = os.environ.get('PROD_UPLOADS_DEFAULT_URL')

if STAGING:
    GITHUB_CLIENT_ID = os.environ.get('STAGING_GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('STAGING_GITHUB_CLIENT_SECRET')
    GITHUB_CALLBACK_URL = os.environ.get('STAGING_GITHUB_CALLBACK_URL')
    HOOK_SECRET_KEY = os.environ.get('HOOK_SECRET_KEY')
    ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'
    OAUTH_TOKEN = os.environ.get('STAGING_OAUTH_TOKEN')
    SECRET_KEY = os.environ.get('STAGING_SECRET_KEY')
    UPLOADS_DEFAULT_DEST = os.environ.get('STAGING_UPLOADS_DEFAULT_DEST')
    UPLOADS_DEFAULT_URL = os.environ.get('STAGING_UPLOADS_DEFAULT_URL')

# see secrets.py.example for the rest of the config values that need
# to be modified for localhost development
if LOCALHOST:
    ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'
    UPLOADS_DEFAULT_DEST = BASE_DIR + '/uploads/'
    UPLOADS_DEFAULT_URL = 'http://localhost:5000/uploads/'

# Enable/disable AB testing
AB_TESTING = os.environ.get('AB_TESTING') == 'True'

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
    u'worksforme': {'id': 0, 'order': 7, 'state': 'closed'}}

# We don't need to compute for every requests.
OPEN_STATUSES = [status for status in STATUSES
                 if STATUSES[status]['state'] == 'open']

# Messages Configuration

CSS_FIX_ME = """
    This resource doesn't exist anymore.
    See https://github.com/webcompat/css-fixme/
    for more details."""

IS_BLACKLISTED_DOMAIN = (u'Anonymous reporting for domain {0} '
                        'is temporarily disabled. Please contact '
                        'miket@mozilla.com '
                        'for more details.')

SHOW_RATE_LIMIT = """
    All those moments will be lost in time…
    like tears in rain…
    Time to die.
    – Blade Runner

    This resource doesn't exist anymore."""

WELL_KNOWN_ALL = """
    Sorry dear bot,
    the route /.well-known/{subpath} doesn't exist.

    Nothing behind me, everything ahead of me, as is ever so on the road.
    - Jack Kerouac, On the Road."""

WELL_KNOWN_SECURITY = """Contact: mailto:kdubost+securitywebc@mozilla.com
Contact: mailto:miket@mozilla.com
"""
