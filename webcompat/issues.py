#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from flask import session
from form import build_formdata
from webcompat import github, app

URI = app.config['ISSUES_REPO_URI']


def report_issue(form):
    return github.post('repos/' + URI, build_formdata(form))


def proxy_report_issue():
    pass
