#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Grab the changelog for issues."""

import argparse
import datetime
import os
import re
import sys
from urllib.parse import quote_plus
from urllib.parse import urlunsplit

import requests

# This will start an initialization process.
sys.path.append(os.path.realpath(os.getcwd()))
from config.secrets import OAUTH_TOKEN  # noqa

# Config
GITHUB_API = 'api.github.com'
ROOT_REPO = '/repos/webcompat'
REPO_TEST = 'webcompat-tests'
REPO_BUGS = 'webcompat.com'
QUERY_PARAM = 'labels'
QUERY_VALUE = 'status: add to changelog'
HEADERS = {'Accept': 'application/vnd.github.v3+json',
           'Authorization': 'token {token}'.format(token=OAUTH_TOKEN),
           'User-Agent': 'webcompat/webcompat-bot'}
# Templates for producing the changelog
LINE_TEMPLATE = '* {title} [Pull #{number}]({url})\n'
LOG_TEMPLATE = """

## X.X.X - {date}

{loglines}

"""


def get_remote_file(url):
    """Request URL."""
    r = requests.get(url, headers=HEADERS)
    json_response = r.json()
    return json_response


def create_changelog(changes):
    """Extract the number of open issues."""
    loglines = ''
    for issue in changes:
        title = normalize_title(issue['title'])
        number = issue['number']
        url = issue['html_url']
        loglines += LINE_TEMPLATE.format(title=title, url=url, number=number)
    return loglines


def delete_label(url):
    """Delete the label for an issue."""
    r = requests.delete(url, headers=HEADERS)
    return r.status_code


def normalize_title(title):
    """Attempt at normalizing the title.

    Using a regex to match a number of cases.
    See the test suite for the potential matches.
    GitHub sends us a unicode string.
    """
    if '🚀' in title:
        title = title.replace('🚀', '')
        title = title.strip()
        title = 'NPM update - {title}.'.format(title=title)
    else:
        regex = r"[^ ]?\#(?P<number>\d+)[^\w]+(?P<prose>.*)"
        m = re.search(regex, title)
        log_line = 'Fixes #{msg[number]} - {msg[prose]}'
        title = log_line.format(msg=m.groupdict())
    return title


def main():
    """Core program."""
    # Parsing arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--delete', action='store_true',
                        help='delete the changelog label on GitHub.')
    parser.add_argument('-t', '--testmode', action='store_true',
                        help='try on webcompat-tests only.')
    args = parser.parse_args()

    # Impossible to erase things by default.
    erase_label = False

    if args.delete:
        erase_label = True
    if args.testmode:
        repo = REPO_TEST
    else:
        repo = REPO_BUGS

    # Create the query PATH
    path = '{root}/{repo}/issues'.format(root=ROOT_REPO, repo=repo)
    query = 'state=all&{param}={value}'.format(
        param=QUERY_PARAM, value=quote_plus(QUERY_VALUE))
    url_query = urlunsplit(('https', GITHUB_API, path, query, ''))
    # Query the data for the changelog
    json_response = get_remote_file(url_query)
    # Print out the changelog
    loglines = create_changelog(json_response)
    today = datetime.date.today().isoformat()
    changelog = LOG_TEMPLATE.format(date=today, loglines=loglines)
    print(changelog)

    if erase_label:
        path_tmp = '{root}/{repo}/issues/{number}/labels/{label}'
        for issue in json_response:
            number = issue['number']
            label_path = path_tmp.format(
                root=ROOT_REPO, repo=repo, number=number, label=QUERY_VALUE)
            url = urlunsplit(('https', GITHUB_API, label_path, '', ''))
            print(('Deleting "{label}" for {number} on {repo}…'.format(
                label=QUERY_VALUE, number=number, repo=repo)))
            status = delete_label(url)
            print(('{status} for issue {number}'.format(
                status=status, number=number)))


if __name__ == "__main__":
    sys.exit(main())
