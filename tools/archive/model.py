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

HEADERS = {'Accept': 'application/vnd.github.v3.html+json',
           'User-Agent': 'WebCompat.com Archiver',
          }

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
    body: str
    comments_url: str
    comments_number: int
    comments: List[Comment] = field(
        init=False,
        default_factory=list
        )
    locked: bool
    issue_created: datetime
    issue_updated: datetime


    @classmethod
    def from_dict(cls, payload):
        """Class method to allow instantiation from a GitHub response dict."""
        # GitHub payload contains an issue part
        return cls(
            number = payload.get('number'),
            title = payload.get('title'),
            body = payload.get('body_html'),
            comments_number = payload.get('comments'),
            comments_url = payload.get('comments_url'),
            locked = payload.get('locked'),
            issue_created = to_datetime(payload.get('created_at')),
            issue_updated = to_datetime(payload.get('updated_at')),
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
                    body=comment.get('body_html'),
                    created_at=to_datetime(comment.get('created_at')),
                    updated_at=to_datetime(comment.get('updated_at'))
                    )
                )
        return comments


    def get_comments(self, comments_url):
        """Getting the comments for an url"""
        links = {}
        comments = {}
        try:
            r = requests.get(comments_url, headers=HEADERS)
            r.raise_for_status()
        except HTTPError as err:
            logging.warning(f'Fetching comments failed {err}')
        else:
            links = r.links
            comments = r.json()
        return comments, links


    def recursive_fetch(self, comments_url, prev_comments=[]):
        """Fetch all comments.

        * if 0 comments, response is empty
        * if 1 page of comments, no links http header
        * if 1+ page of comments
          1st page has               next, last
          next page has first, prev, next, last
          last page has first, prev

        so when there is no more next, we reached the last page
        """
        comments, links = self.get_comments(comments_url)
        prev_comments.extend(comments)
        if links:
            has_next = links.get('next', False)
            if has_next:
                self.recursive_fetch(has_next['url'], comments)
        return comments


@dataclass
class ArchivedIssue(Issue):
    """WebCompat Archived Issue Model.

    This provides a couple of additional methods
    to make it possible to archive the issue as html or any format
    deemed important. It inherits from a larger Issue model
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
        if self.locked:
            locked = 'yes'
        else:
            locked = 'no'
        if self.has_comments():
            # Let's initialize the comments
            self.fetch_comments()
        html_issue = issue_template.render(
            number = self.number,
            comments_number = self.comments_number,
            title = self.title,
            issue_body = self.body,
            locked = locked,
            issue_created = self.issue_created.strftime('%Y-%m-%d'),
            issue_updated = self.issue_updated.strftime('%Y-%m-%d'),
            comments = self.comments,
            )
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


def to_datetime(date_str):
    """Convert date to datetime object.

    date_str: 2015-07-28T09:25:03Z
    """
    normalized_date_str = date_str.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized_date_str)

