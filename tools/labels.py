#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import requests
import json
import sys
from webcompat import app

API_URI = 'https://api.github.com/repos/'
ISSUES_URI = app.config['ISSUES_REPO_URI'].rpartition('/issues')[0]
USER_LABELS_URI = API_URI + ISSUES_URI + "/labels"
WEBCOMPAT_LABELS_URI = API_URI + 'webcompat/webcompat-tests/labels'
AUTH_HEADERS = {'Authorization': 'token {0}'.format(app.config['OAUTH_TOKEN']),
                'User-Agent': 'webcompat/webcompat-bot'}


def get_issue_labels(labels_uri):
    '''Get the issue labels from the given repo.'''
    response = requests.get(labels_uri)
    if not response.status_code == 200:
        response.raise_for_status()
    return response.json()


def create_label(labels):
    '''Create a label in the user repo'''
    response = requests.post(
        USER_LABELS_URI,
        json.dumps(labels),
        headers=AUTH_HEADERS)
    if not response.status_code == 201:
        response.raise_for_status()


def delete_label(name):
    '''Delete a label in the user repo'''
    delete_labels_uri = USER_LABELS_URI + "/" + name
    response = requests.delete(delete_labels_uri, headers=AUTH_HEADERS)
    if not response.status_code == 204:
        response.raise_for_status()


def main():
    '''Duplicate webcompat test repo labels in user test repo'''
    # check if the user repo is a webcompat repo
    if (ISSUES_URI == "webcompat/webcompat-tests" or
            ISSUES_URI == "webcompat/webcompat.com"):
        sys.exit("Error: Attempting to change a webcompat repo")
    try:
        # get all existing labels from the user issues repo
        user_labels = get_issue_labels(USER_LABELS_URI)
        # delete all existing labels from the user issues repo
        for label in user_labels:
            delete_label(label.get('name'))
        # get all labels from the webcompat tests repo
        webcompat_labels = get_issue_labels(WEBCOMPAT_LABELS_URI)
        # re-create labels in user issues repo
        for label in webcompat_labels:
            data = {"name": label.get('name'), "color": label.get('color')}
            create_label(data)
        sys.exit(0)
    except requests.exceptions.HTTPError as e:
        # handles exceptions occuring due to undesired response status code
        sys.exit("Error: {}".format(e))
    except requests.exceptions.RequestException as e:
        # handles all other exceptions
        sys.exit("Error: {}".format(e))


if __name__ == '__main__':
    main()
