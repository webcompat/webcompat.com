#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import argparse
import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict
import subprocess
import sys

IMPORT_ERROR = '''
==============================================
It seems like you don't have all dependencies.
Please re-run:
    pip install -r requirements.txt
==============================================
'''

try:
    from webcompat import app
except ImportError, e:
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
    '''Check installed pip dependencies.

    Make sure that the installed pip packages match what is in
    requirements.txt, prompting the user to upgrade if not.
    '''
    for req in open("requirements.txt"):
        try:
            pkg_resources.require(req)
        except VersionConflict as e:
            print(DEPS_VERSION_HELP % e)
        except DistributionNotFound as e:
            print(DEPS_NOTFOUND_HELP % e)
        else:
            return True


def config_validator():
    '''Make sure the config file is ready.'''
    # Checking if oauth token is configured
    if app.config['OAUTH_TOKEN'] == '':
        sys.exit(TOKEN_HELP)

if __name__ == '__main__':
    # testing the config file
    config_validator()
    # Parsing arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--testmode', action='store_true',
                        help='Run server in "test mode".')
    args = parser.parse_args()

    if args.testmode:
        # disable HttpOnly setting for session cookies so Selenium
        # can interact with them. *ONLY* do this for testing.
        app.config['SESSION_COOKIE_HTTPONLY'] = False
        print("Starting server in ~*TEST MODE*~")
        app.run(host='localhost')
    else:
        if check_pip_deps():
            app.run(host='localhost')
