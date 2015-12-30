#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os

# Define the application base directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))

# the PRODUCTION and DEVELOPMENT environment variables are set in uwsgi.conf
# on the webcompat server. If they're not set, they will default to None
PRODUCTION = os.environ.get('PRODUCTION')
DEVELOPMENT = os.environ.get('DEVELOPMENT')
# Are we serving the app from localhost?
LOCALHOST = not PRODUCTION and not DEVELOPMENT
