#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from webcompat import app
from webcompat.db import issue_db
from webcompat.db import WCIssue


def row_to_dict(row):
    d = {}
    for column in row.__table__.columns:
        if(column.name == 'issue_id' or column.name == 'domain' or
                column.name == 'summary'):
            d[column.name] = str(getattr(row, column.name))
    return d


def domain_search(search_domain):
    '''Returns the ten most recent issues with a similar domain name'''
    search_domain += "%"
    session = issue_db()
    query_result = (
        session.query(WCIssue)
        .filter(WCIssue.domain.like(search_domain))
        .limit(10)
        .all())
    result_dict = [row_to_dict(r) for r in query_result]
    return result_dict
