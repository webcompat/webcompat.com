#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""WebCompat Issue Model for archives."""

from dataclasses import dataclass
from dataclasses import field
from datetime import datetime
import logging
import pathlib
from typing import List

from jinja2 import Environment
from jinja2 import PackageLoader
from jinja2 import select_autoescape
from jinja2 import Template
import requests
from requests.exceptions import HTTPError


@dataclass
class Comment:
    """Model for describing the comments."""
    author: str
    created_at: datetime
    updated_at: datetime
    body: str


@dataclass
class Issue:
    """WebCompat Issue Model."""

    number: int
    title: str
    comments_url: str
    comments_number: int
    comments: List[Comment] = field(
        init=False,
        default_factory=list
        )

    @classmethod
    def from_dict(cls, payload):
        """Class method to allow instantiation from a GitHub response dict."""
        # GitHub payload contains an issue part
        return cls(
            number = payload.get('number'),
            title = payload.get('title'),
            comments_number = payload.get('comments'),
            comments_url = payload.get('comments_url')
        )


    def has_comments(self):
        """Check the number of comments and returns a bool."""
        if self.comments_number == 0:
            return False
        return True


    def fetch_comments(self):
        """Fetch comments from an issue."""
        if self.has_comments():
            comments_json = self.recursive_fetch(self.comments_url)
            self.comments = self.comments_as_list(comments_json)
        else:
            self.comments = []


    def comments_as_list(self, comments_json):
        """Create a list of Comments object.

        - author
        - body
        - date_created
        - date_updated
        """
        comments = []
        for comment in comments_json:
            comments.append(
                Comment(
                    author=comment['user']['login'],
                    body=comment.get('body'),
                    created_at=to_datetime(comment.get('created_at')),
                    updated_at=to_datetime(comment.get('updated_at'))
                    )
                )
        return comments


    @staticmethod
    def recursive_fetch(comments_url):
        """Fetch all comments."""
        try:
            r = requests.get(comments_url)
            r.raise_for_status()
        except HTTPError as err:
            logging.warning(f'Fetching comments failed {err}')
        else:
            comments = r.json()
            while 'next' in r.links.keys():
                r = requests.get(r.links['next']['url'])
                comments.extend(r.json())
            return comments


@dataclass
class ArchivedIssue(Issue):
    """WebCompat Archived Issue Model.

    This provide a couple of additional methods
    to make it possible to archive the issue as html or any format
    dimmed important. It inherits from a larger Issue model
    """
    def as_html(self, template='archive'):
        """Create an html rendering of an issue.

        template: str
            directory name with all subtemplates
        return: str
            it returns an html file with the content of the issue.
        """
        env = Environment(
            loader=PackageLoader('tools.archive', f'templates/{template}'),
            autoescape=select_autoescape(['html'])
        )
        issue_template = env.get_template('issue.html')
        html_issue = issue_template.render(number = self.number)
        return html_issue


    def save(self, root_dir_path=None):
        """Save an issue in a specific location.

        root_dir: pathlib.Path
            full path to where the directory will be saved.
        return: pathlib.Path
            it returns the full file location of the archived issue.
            Probably /static/issue/issue-number.html for webcompat.com
        """
        archived_name = f'issue-{self.number}.html'
        location = root_dir_path / 'static' / 'issue' / archived_name
        content = self.as_html()
        if not location.parent.is_dir():
            location.parent.mkdir(parents=True)
        location.write_text(content)
        return location


def make_request(url):
    """create a request."""
    return requests.get(url)


def to_datetime(date_str):
    """Convert date to datetime object.

    date_str: 2015-07-28T09:25:03Z
    """
    normalized_date_str = date_str.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized_date_str)
