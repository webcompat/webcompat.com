#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""Script to fetch the current list of repo labels from GitHub."""

import datetime
import json
import logging
import os
import sys

import requests

from webcompat import app

# Config
URL = 'https://api.github.com/graphql'
HEADERS = {"Authorization": "bearer {0}".format(app.config['OAUTH_TOKEN'])}
LOGGER = app.logger
QUERY = """
query FetchLabels($cursor:String){
  repository(owner:"webcompat", name:"web-bugs") {
    labels (after: $cursor, first:100) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          name
        }
      }
    }
  }
}
"""
VARIABLES = {}


def post_query(url, query, variables, headers) -> dict:
    """Run GitHub GraphQL query and return result."""
    try:
        req = requests.post(
            url=url, json={"query": query, "variables": variables}, headers=headers)
        if req.status_code == 200:
            return req.json()
    except requests.exceptions.RequestException as error:
        msg = ("Yikes! Label query failed. {0}").format(error)
        LOGGER.warning(msg)
        return None


def extract_label_list(json_data, label_list):
    """Pull out label objects and add to list."""
    labels = json_data.get("data").get("repository").get("labels")
    cursor = labels.get("pageInfo").get("endCursor")
    for label in labels.get("edges"):
        label_list.append(label.get("node"))
    return cursor, label_list


def process_pages(first_json, label_list):
    """Extract information to query additional pages."""
    cursor, updated_list = extract_label_list(first_json, label_list)
    VARIABLES['cursor'] = cursor
    second_json = post_query(URL, QUERY, VARIABLES, HEADERS)
    return second_json, updated_list


def has_next_page(json_data):
    """Check for more labels."""
    page_info = json_data.get("data").get(
        "repository").get("labels").get("pageInfo")
    if page_info.get("hasNextPage"):
        return True
    return False


def main():
    """Core program."""
    label_list = []
    cursor = ""
    json_data = post_query(URL, QUERY, VARIABLES, HEADERS)
    if not json_data:
        # If request fails, retry after 3 min
        time.sleep(360)
        json_data = post_query(URL, QUERY, VARIABLES, HEADERS)
        if not json_data:
            # On a second failure, log an error
            msg = "Yikes! Daily label query failed."
            LOGGER.warning(msg)
            sys.exit(1)
    while has_next_page(json_data):
        json_data, label_list = process_pages(json_data, label_list)
    cursor, updated_list = extract_label_list(json_data, label_list)
    labels_path = os.path.join(app.config['DATA_PATH'], "labels.json")
    today = datetime.date.today().isoformat()
    with open(labels_path, 'w') as f:
        f.write(json.dumps(updated_list))
        msg = ("Labels list updated and saved in data/ on {0}").format(today)
        LOGGER.info(msg)


if __name__ == "__main__":
    sys.exit(main())
