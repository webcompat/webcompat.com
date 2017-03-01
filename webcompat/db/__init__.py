#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from hashlib import sha512

from webcompat import app

issue_engine = create_engine('sqlite:///' + os.path.join(
    app.config['BASE_DIR'], 'issues.db'))
issue_db = scoped_session(sessionmaker(autocommit=False,
                                       autoflush=False,
                                       bind=issue_engine))
IssueBase = declarative_base()
IssueBase.query = issue_db.query_property()


class WCIssue(IssueBase):
    __tablename__ = 'webcompat_issues'

    issue_id = Column(String(128), unique=True, primary_key=True)
    summary = Column(String(256))
    url = Column(String(1024))
    body = Column(String(2048))

    def __init__(self, issue_id, summary, url, body):
        self.issue_id = issue_id
        self.summary = summary
        self.url = url
        self.body = body

IssueBase.metadata.create_all(bind=issue_engine)
