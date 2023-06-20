#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Module handles saving reports to BQ."""

import uuid
import logging

from google.cloud import bigquery
from webcompat import app
from webcompat.form import build_formdata_bq

log = app.logger
log.setLevel(logging.INFO)

BQ_PROJECT = app.config['BQ_PROJECT']
BQ_TABLE = app.config['BQ_TABLE']


def send_bq_report(form, github_issue_url=None):
    """Send a report to BQ."""
    data = build_formdata_bq(form, github_issue_url)
    data['uuid'] = str(uuid.uuid4())
    status = 'error'

    try:
        client = bigquery.Client(project=BQ_PROJECT)
        errors = client.insert_rows_json(BQ_TABLE, [data])

        if not errors:
            msg = f"BQ report has been recorded for: {data['url']}"
            status = 'success'
        else:
            msg = f"BQ encountered errors: {data['url']} {errors}"

        log.info(msg)

    except Exception as error:
        log.error(
            "An exception occurred when saving to BQ: ",
            error
        )

    return status
