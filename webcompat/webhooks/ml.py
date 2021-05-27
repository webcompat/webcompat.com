#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Helpers methods for machine learning classification."""

import requests
import time
import logging

from requests.exceptions import ConnectionError

from webcompat import app

BUGBUG_HTTP_SERVER = app.config['BUGBUG_HTTP_SERVER']
CLASSIFIER_PATH = app.config['CLASSIFIER_PATH']


def make_classification_request(issue_number):
    """Make a request to bugbug http service."""
    url = f"{BUGBUG_HTTP_SERVER}/{CLASSIFIER_PATH}/{issue_number}"
    headers = {"X-Api-Key": "webcompat"}
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response


def get_issue_classification(issue_number, max_retry_count=4, retry_sleep=7):
    """Get issue classification from bugbug.

    As classification happens in the background we need to make a second
    request to get results, so we're polling the endpoint.

    The service returns 202 status if request is still in process
    and 200 status if the issue is classified
    """
    log = app.logger
    log.setLevel(logging.INFO)
    start = time.monotonic()
    retry_count = 0
    for _ in range(max_retry_count):
        response = make_classification_request(issue_number)

        if response.status_code == 202:
            time.sleep(retry_sleep)
        else:
            retry_count = _
            break
    else:
        total = round(time.monotonic() - start, 2)
        msg = f"ML FAIL: issue {issue_number} in {total} seconds with {max_retry_count} retries"  # noqa
        raise ConnectionError(msg)
    total = round(time.monotonic() - start, 2)
    msg = f"ML OK: issue {issue_number} in {total} seconds with {retry_count} retries"  # noqa
    log.info(msg)
    return response.json()
