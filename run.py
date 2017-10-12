#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Starter file for the project."""

import argparse
import json
import os
import pkg_resources
from pkg_resources import DistributionNotFound
from pkg_resources import VersionConflict
import sys
import urlparse

import requests

from config.environment import STATUSES

IMPORT_ERROR = '''
==============================================
It seems like you don't have all dependencies.
Please re-run:
    pip install -r config/requirements.txt
==============================================
'''

NO_CONF_ERROR = '''
==============================================
The config.py file seems to be missing.

Please create a copy of config.py.example and customize it accordingly.
For details, please see
https://github.com/webcompat/webcompat.com/blob/master/CONTRIBUTING.md#configuring-the-server
==============================================
'''

MILESTONE_ERROR = '''It failed with {msg}!
We will read from data/milestones.json.
'''


try:
    from webcompat import app
except ImportError as e:
    if 'import_name' in e and e.import_name == 'config':
        # config not found, did you forget to copy config.py.example?
        raise ImportError('{0}\n\n{1}'.format(e, NO_CONF_ERROR))
    else:
        raise ImportError('{0}\n\n{1}'.format(e, IMPORT_ERROR))


TOKEN_HELP = '''
The OAUTH_TOKEN is not configured in your config file.
You will need to set up one on github for testing your
local developments.
Read Instructions at
https://github.com/webcompat/webcompat.com/blob/master/CONTRIBUTING.md#configuring-the-server
'''

DEPS_VERSION_HELP = '''
The following required versions do not match your locally installed versions:

  %s

Install the correct versions using the commands below before continuing:

pip uninstall name
pip install name==1.2.1
'''

DEPS_NOTFOUND_HELP = '''
The following required module is missing from your installation.

  %s

Install the module using the command below before continuing:

pip install name==1.2.1
'''


def check_pip_deps():
    """Check installed pip dependencies.

    Make sure that the installed pip packages match what is in
    requirements.txt, prompting the user to upgrade if not.
    """
    for req in open("./config/requirements.txt"):
        try:
            pkg_resources.require(req)
        except VersionConflict as e:
            print(DEPS_VERSION_HELP % e)
        except DistributionNotFound as e:
            print(DEPS_NOTFOUND_HELP % e)
        else:
            return True


def config_validator():
    """Make sure the config file is ready."""
    # Checking if oauth token is configured
    if app.config['OAUTH_TOKEN'] == '':
        sys.exit(TOKEN_HELP)


def initialize_status():
    """Map the status name with the milestone id on GitHub.

    The project needs the mapping in between milestones and their id
    to be able to query status related things. It uses a backup version
    when the request to GitHub fails.
    """
    print('Statuses Initialization…')
    REPO_ROOT = app.config['ISSUES_REPO_URI'].rpartition('/issues')[0]
    milestones_url_path = os.path.join('repos', REPO_ROOT, 'milestones')
    milestones_url = urlparse.urlunparse(
        ('https', 'api.github.com', milestones_url_path, '', '', ''))
    milestones_path = os.path.join(app.config['DATA_PATH'], 'milestones.json')
    try:
        # Get the milestone from the network
        print('Fetching milestones from Github…')
        r = requests.get(milestones_url)
        milestones_content = r.content
        print(r.status_code)
        if r.status_code == 200:
            with open(milestones_path, 'w') as f:
                f.write(r.content)
            print('Milestones saved in data/')
        r.raise_for_status()
    except requests.exceptions.HTTPError as error:
        # Not working, let's use the cached copy
        # This might fail the first time.
        print(MILESTONE_ERROR.format(msg=error))
        with open(milestones_path, 'r') as f:
            milestones_content = f.read()
    finally:
        # save in data/ the current version
        if milestones_content:
            app.config.update(STATUSES=convert_milestones(milestones_content))
            app.config.update(JSON_STATUSES=json.dumps(app.config['STATUSES']))
            print('Milestones in memory')
            return True
        else:
            return False


def convert_milestones(milestones_content):
    """Convert the JSON milestones from GitHub to a simple dict."""
    milestone_full = json.loads(milestones_content)
    for milestone in milestone_full:
        STATUSES[milestone['title']]['id'] = milestone['number']
    return STATUSES


if __name__ == '__main__':
    # Parsing arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--testmode', action='store_true',
                        help='Run server in "test mode".')
    args = parser.parse_args()

    if check_pip_deps():
        # We need the milestones
        if not initialize_status():
            sys.exit('Milestones are not initialized.')
        if not args.testmode:
            # testing the config file.
            # this file is only important in non-test mode.
            # in test mode everything must be mocked,
            # so there is no external api communication.
            config_validator()
            app.run(host='localhost')
        else:
            # disable HttpOnly setting for session cookies so Selenium
            # can interact with them. *ONLY* do this for testing.
            app.config['SESSION_COOKIE_HTTPONLY'] = False
            app.config['TESTING'] = True
            print("Starting server in ~*TEST MODE*~")
            app.run(host='localhost')
