#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Generic configuration for the project."""

from distutils.util import strtobool
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
    PRIVATE_REPO_URI = 'webcompat/web-bugs-private/issues'
    PRIVATE_REPO_MILESTONE = 13
    OAUTH_TOKEN = os.environ.get('PROD_OAUTH_TOKEN')
    SECRET_KEY = os.environ.get('PROD_SECRET_KEY')
    UPLOADS_DEFAULT_DEST = os.environ.get('PROD_UPLOADS_DEFAULT_DEST')
    UPLOADS_DEFAULT_URL = os.environ.get('PROD_UPLOADS_DEFAULT_URL')
    ANONYMOUS_REPORTING_ENABLED = strtobool(
        os.environ.get("PROD_ANON_REPORTING", "off")
    )
    BUGBUG_HTTP_SERVER = "https://bugbug.moz.tools"
    CLASSIFIER_PATH = "needsdiagnosis/predict/github/webcompat/web-bugs-private"  # noqa
    AUTOCLOSED_MILESTONE_ID = 15
    ES_URL = os.environ.get('ES_URL')
    ES_API_KEY_ID = os.environ.get('ES_API_KEY_ID')
    ES_API_KEY = os.environ.get('ES_API_KEY')

if STAGING:
    GITHUB_CLIENT_ID = os.environ.get('STAGING_GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('STAGING_GITHUB_CLIENT_SECRET')
    GITHUB_CALLBACK_URL = os.environ.get('STAGING_GITHUB_CALLBACK_URL')
    HOOK_SECRET_KEY = os.environ.get('HOOK_SECRET_KEY')
    ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'
    PRIVATE_REPO_URI = 'webcompat/webcompat-tests-private/issues'
    PRIVATE_REPO_MILESTONE = 1
    OAUTH_TOKEN = os.environ.get('STAGING_OAUTH_TOKEN')
    SECRET_KEY = os.environ.get('STAGING_SECRET_KEY')
    UPLOADS_DEFAULT_DEST = os.environ.get('STAGING_UPLOADS_DEFAULT_DEST')
    UPLOADS_DEFAULT_URL = os.environ.get('STAGING_UPLOADS_DEFAULT_URL')
    ANONYMOUS_REPORTING_ENABLED = strtobool(
        os.environ.get("STAGING_ANON_REPORTING", "off")
    )
    BUGBUG_HTTP_SERVER = "https://bugbug.moz.tools"
    CLASSIFIER_PATH = "needsdiagnosis/predict/github/webcompat/webcompat-tests-private"  # noqa
    AUTOCLOSED_MILESTONE_ID = 5
    ES_URL = os.environ.get('ES_URL')
    ES_API_KEY_ID = os.environ.get('ES_API_KEY_ID')
    ES_API_KEY = os.environ.get('ES_API_KEY')


if LOCALHOST:
    # for now we are using .env only on localhost
    from dotenv import load_dotenv
    load_dotenv(os.path.join(BASE_DIR, '.env'))
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID') or os.environ.get('FAKE_ID')  # noqa
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET') or os.environ.get('FAKE_SECRET')  # noqa
    ISSUES_REPO_URI = 'webcompat/webcompat-tests/issues'
    PRIVATE_REPO_URI = 'webcompat/webcompat-tests-private/issues'
    PRIVATE_REPO_MILESTONE = 1
    UPLOADS_DEFAULT_DEST = BASE_DIR + '/uploads/'
    UPLOADS_DEFAULT_URL = 'http://localhost:5000/uploads/'
    OAUTH_TOKEN = os.environ.get('OAUTH_TOKEN')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'NO SECRETS'
    HOOK_SECRET_KEY = os.environ.get('HOOK_SECRET_KEY') or 'SECRETS'
    ANONYMOUS_REPORTING_ENABLED = strtobool(
        os.environ.get("ANONYMOUS_REPORTING", "on")
    )
    AB_EXPERIMENTS = strtobool(
        os.environ.get("AB_EXPERIMENT", "off")
    )
    BUGBUG_HTTP_SERVER = "http://0.0.0.0:8000"
    CLASSIFIER_PATH = "needsdiagnosis/predict/github/webcompat/webcompat-tests-private"  # noqa
    AUTOCLOSED_MILESTONE_ID = 5
    ES_URL = os.environ.get('ES_URL')
    ES_API_KEY_ID = os.environ.get('ES_API_KEY_ID')
    ES_API_KEY = os.environ.get('ES_API_KEY')

# BUG STATUS
# The id will be initialized when the app is started.
STATUSES = {
    'needstriage': {'id': 0, 'order': 1, 'state': 'open'},
    'needsdiagnosis': {'id': 0, 'order': 2, 'state': 'open'},
    'needscontact': {'id': 0, 'order': 3, 'state': 'open'},
    'contactready': {'id': 0, 'order': 4, 'state': 'open'},
    'sitewait': {'id': 0, 'order': 5, 'state': 'open'},
    'duplicate': {'id': 0, 'order': 1, 'state': 'closed'},
    'fixed': {'id': 0, 'order': 2, 'state': 'closed'},
    'incomplete': {'id': 0, 'order': 3, 'state': 'closed'},
    'invalid': {'id': 0, 'order': 4, 'state': 'closed'},
    'moved': {'id': 0, 'order': 5, 'state': 'closed'},
    'non-compat': {'id': 0, 'order': 6, 'state': 'closed'},
    'wontfix': {'id': 0, 'order': 7, 'state': 'closed'},
    'worksforme': {'id': 0, 'order': 8, 'state': 'closed'}}

# We don't need to compute for every requests.
OPEN_STATUSES = [status for status in STATUSES
                 if STATUSES[status]['state'] == 'open']

# Messages Configuration

CSS_FIX_ME = """
    This resource doesn't exist anymore.
    See https://github.com/webcompat/css-fixme/
    for more details."""

IS_BLOCKED_DOMAIN = ('Anonymous reporting for domain {0} '
                     'is temporarily disabled. Please contact '
                     'webcompat@mozilla.com '
                     'for more details.')

IS_DARKNET_DOMAIN = ('Reporting for .onion domains is disabled.'
                     'Please contact webcompat@mozilla.com '
                     'for more details.')

MESSAGE_410 = """
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

# AB setup
# Comma separated list of user IDs to exempt from experiments
AB_EXEMPT_USERS = os.environ.get('AB_EXEMPT_USERS', '').split(',')

# SHA reference for the current deployed version
# The Git SHA is written in data/ at deployment time.
# This is used in views.py for /.well-known/deployed-version route
try:
    with open(os.path.join(DATA_PATH, 'sha.txt')) as f:
        SHA_VERSION = (f.read(), 200)
except FileNotFoundError as oops:
    SHA_VERSION = ('no sha.', 404)
