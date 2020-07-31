#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""WebCompat Issue Model for archives."""

from dataclasses import dataclass
from dataclasses import field

from jinja2 import Environment
from jinja2 import PackageLoader
from jinja2 import select_autoescape
from jinja2 import Template



@dataclass
class Issue:
    """WebCompat Issue Model.

    browser: str
        name of the browser and version.
        ex: 'Firefox Mobile 80.0'
    console_url: str
        location of the console.log
        ex: 'https://webcompat.com/console_logs/2020/6/598955a8-f3b9-4d8a-af58-fe8cad822f05'
    description: str
        short description of the issue.
        ex: 'Page not loading correctly'
    details: list
        list of parameters defined in the browser
        ex: ['gfx.webrender.all: false', 'gfx.webrender.blob-images: true', 'gfx.webrender.enabled: false']
    labels: list
        list of labels associated with the issue
        ex: ['browser-firefox-mobile', 'engine-gecko']
    number: int
        reference issue number
        ex: 12345
    reported_with: str
        what the issue was reported with among
            - desktop-reporter
            - mobile-reporter
            - web
        ex: 'desktop-reporter'
    stage: str
        life stage of the issue:
        - open: needstriage, needsdiagnosis, needscontact, contactready, sitewait
        - closed: invalid, fixed, non-compat, incomplete, duplicate, worksforme, wontfix
        ex: 'wontfix'
    status: str
        status of the issue, either open or closed
        ex: 'open'
    steps: str
        prose of instructions and comments to reproduce the issue
    title: str
        full title of the issue
        ex: 'broken.example.org - Page not loading correctly'
    ua_header: str
        browser UA string used for reporting the issue
        ex: 'Mozilla/5.0 (Android 9; Mobile; rv:79.0) Gecko/79.0 Firefox/79.0'
    url: str
        https://broken.example.org/punk/cat
    """
    number: int
    title: str


    @classmethod
    def from_dict(cls, payload):
        """Class method to allow instantiation from a GitHub response dict."""
        # GitHub payload contains an issue part
        issue = payload.get('issue')
        return cls(
            number = issue.get('number'),
            title = issue.get('title')
        )


@dataclass
class ArchivedIssue(Issue):
    """WebCompat Archived Issue Model.

    This provide a couple of additional methods
    to make it possible to archive the issue as html or any format
    dimmed important. It inherits from a larger Issue model
    """
    def as_html(self, template='archive'):
        """Create an html rendering of an issue.

        template: directory name with all subtemplates
        it returns an html file with the content of the issue.
        """
        env = Environment(
            loader=PackageLoader('tools.archive', f'templates/{template}'),
            autoescape=select_autoescape(['html'])
        )
        issue_template = env.get_template('issue.html')
        html_issue = issue_template.render(number = self.number)
        print(html_issue)
        return html_issue
