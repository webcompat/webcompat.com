#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""This module handles application configuration and secrets."""

from collections import namedtuple
import errno
import json
import os
import shutil
import sys
import tempfile
import urllib.parse

import requests

<<<<<<< 4bcbb9acc4fe7056c13dca6dc8af532492d2174d
from environment import *  # noqa
from secrets import *  # noqa
=======
from config.environment import *  # nopep8
from config.secrets import *  # nopep8
>>>>>>> Issue #2348 - Converts webcompat/ to python 3

MILESTONE_ERROR = """It failed with {msg}!
We will read from data/milestones.json.
"""
MILESTONE_MISSING_FILE = """Oooops.
We can't find {path}
Double check that everything is configured properly
in config/secrets.py and try again. Good luck!
"""
MILESTONE_UNMATCHING = """A milestone is missing or has been added: {names}"""
MILESTONE_UNMATCHING_ERROR = """Check the milestones names on your Github repository and try again.
This error was probably caused by a typo.
Your milestones.json was erased and a backup copy was created at {path}.
"""


def initialize_status():
    """Map the status name with the milestone id on GitHub.

    The project needs the mapping in between milestones and their id
    to be able to query status related things. It uses a backup version
    when the request to GitHub fails.
    """
    milestones_content = None
    print('Statuses Initialization…')
    REPO_ROOT = ISSUES_REPO_URI.rpartition('/issues')[0]
    milestones_url_path = os.path.normcase(
        os.path.join('repos', REPO_ROOT, 'milestones'))
    milestones_url = urllib.parse.urlunparse(
        ('https', 'api.github.com', milestones_url_path, '', '', ''))
    milestones_path = os.path.join(DATA_PATH, 'milestones.json')
    # Attempt to fetch from data/milestones.json
    milestones_content = milestones_from_file(milestones_path)
    milestones_backup_path = os.path.join(DATA_PATH, 'milestones_backup.json')
    if not milestones_content:
        try:
            # Get the milestone from the network
            print('Fetching milestones from Github…')
            r = requests.get(milestones_url)
            # r.content is bytes
            milestones_content = r.content
            if r.status_code == 200:
                with open(milestones_path, 'w') as f:
                    # converting from bytes to str
                    f.write(milestones_content.decode('utf-8'))
                print('Milestones saved in data/')
            r.raise_for_status()
        except requests.exceptions.HTTPError as error:
            # Not working, we exit the program.
            print(MILESTONE_ERROR.format(msg=error))
            return False
    # milestones_content exists
    updated_statuses = update_status_config(milestones_content)
    if not updated_statuses:
        print(MILESTONE_UNMATCHING_ERROR.format(path=milestones_backup_path))
        shutil.copyfile(milestones_path, milestones_backup_path)
        os.remove(milestones_path)
        return False
    app.config['STATUSES'] = updated_statuses
    app.config['JSON_STATUSES'] = json.dumps(app.config['STATUSES'])
    print('Milestones in memory')
    return True


def milestones_from_file(milestones_path):
    """Attempt to read the milestones data from the filesystem."""
    if os.path.isfile(milestones_path):
        with open(milestones_path, 'r') as f:
            # returns a str
            milestones_content = f.read()
        return milestones_content
    else:
        print(MILESTONE_MISSING_FILE.format(path=milestones_path))
        return None


def update_status_config(milestones_content):
    """Convert the JSON milestones from GitHub to a simple dict."""
    milestones = json.loads(milestones_content)
    # Test that GitHub milestones and local definitions are equivalent
    status_names = sorted(STATUSES.keys())
    milestone_names = sorted([milestone['title'] for milestone in milestones])
    # Check if there is a missing milestone. The app will not start.
    if not set(status_names).issubset(milestone_names):
        missing = set(status_names).symmetric_difference(set(milestone_names))
        print(MILESTONE_UNMATCHING.format(names=list(missing)))
        return None
    # Check if there are more milestones than the configured ones.
    # This is probably fine, but we can log a warning.
    if set(status_names) < set(milestone_names):
        # Extract the additional milestones
        intruder = set(status_names).symmetric_difference(set(milestone_names))
        print(MILESTONE_UNMATCHING.format(names=list(intruder)))
    # Assign the right id to the status.
    for milestone in milestones:
        if milestone['title'] in status_names:
            STATUSES[milestone['title']]['id'] = milestone['number']
    return STATUSES


THREADS_PER_PAGE = 8

# ~3 months-ish expires for static junk
SEND_FILE_MAX_AGE_DEFAULT = 9000000

# Flask Limiter settings
# See http://flask-limiter.readthedocs.org/en/latest/#configuration
RATELIMIT_STORAGE_URL = 'memory://'
RATELIMIT_STRATEGY = 'moving-window'

DEBUG = False

if not PRODUCTION:
    DEBUG = True

# localhost runs on HTTP
# use secure and samesite flags on session cookie otherwise
if not LOCALHOST:
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = 'Lax'

# By default, we want to log CSP violations. See /csp-report in views.py.
CSP_LOG = True

# Logging Capabilities
# To benefit from the logging, you may want to add:
#   app.logger.info(Thing_To_Log)
# it will create a line with the following format
# 2015-09-14 20:50:19,185 INFO: Thing_To_Log [in /codepath/views.py:127]

# set the tempdir to somewhere predictable, no matter the platform
try:
    tmp_path = os.path.join(os.getcwd(), 'tmp')
    os.makedirs(tmp_path)
except OSError as exception:
    if exception.errno != errno.EEXIST:
        raise
tempfile.tempdir = tmp_path
print('Writing logs to: {}'.format(tempfile.gettempdir()))

LOG_FILE = os.path.join(tempfile.gettempdir(), 'webcompat.log')
if STAGING:
    LOG_FILE = os.path.join(tempfile.gettempdir(), 'staging-webcompat.log')
LOG_FMT = '%(asctime)s tracking %(message)s'
CSP_REPORTS_LOG = os.path.join(
    tempfile.gettempdir(), 'webcompat-csp-reports.log')

# Status categories used in the project
# 'new', 'needsdiagnosis', 'needscontact', 'contactready' , 'sitewait', 'close'
# Creating the model
Category = namedtuple('Category', ['name', 'dataAttribute', 'label'])
CATEGORIES = []
cat_labels = [('needstriage', 'needstriage', 'Needs Triage'),
              ('needsdiagnosis', 'needsdiagnosis', 'Needs Diagnosis'),
              ('needscontact', 'needscontact', 'Needs Contact'),
              ('ready', 'contactready', 'Ready for Outreach'),
              ('sitewait', 'sitewait', 'Site Contacted'),
              ('close', 'closed', 'Closed')]
# populating the categories for issues status
for cat_label in cat_labels:
    CATEGORIES.append(Category(name=cat_label[0],
                               dataAttribute=cat_label[1],
                               label=cat_label[2]))

# labels that we allow to be added via a `label` GET param, when
# creating an issue.
EXTRA_LABELS = [
    'browser-fenix',
    'browser-focus-geckoview',
    'browser-firefox-reality',
    'type-fastclick',
    'type-google',
    'type-media',
    'type-tracking-protection-basic',
    'type-tracking-protection-strict',
    'type-webrender-enabled',
    'type-webvr',
]

from webcompat import app
# We need the milestones
if not initialize_status():
    sys.exit('Milestones are not initialized. Check logs.')
