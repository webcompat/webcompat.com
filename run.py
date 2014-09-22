#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import argparse

from webcompat import app

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-t', '--testmode', action='store_true',
                        help='Run server in "test mode".')
    args = parser.parse_args()

    if args.testmode:
        # disable HttpOnly setting for session cookies so Selenium
        # can interact with them. *ONLY* do this for testing.
        app.config['SESSION_COOKIE_HTTPONLY'] = False
        print("Starting server in ~*TEST MODE*~")
        app.run()
    else:
        app.run()