#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Databases initialization."""

from hashlib import sha512
import os
from uuid import uuid4

from sqlalchemy import Column
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import String

from webcompat import app

session_engine = create_engine('sqlite:///' + os.path.join(
    app.config['BASE_DIR'], 'session.db'))
session_db = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=session_engine))

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

UsersBase = declarative_base()
UsersBase.query = session_db.query_property()


class User(UsersBase):
    __tablename__ = 'users'

    user_id = Column(String(128), unique=True, primary_key=True)
    access_token = Column(String(128), unique=True)

    def __init__(self, access_token):
        self.access_token = access_token
        # We use the user_id in the session cookie to identify auth'd users.
        # Here we salt and hash the GitHub access token so you can't get
        # back to the auth token if the session cookie was ever compromised.
        self.user_id = sha512(access_token + uuid4().hex).hexdigest()[0:128]


UsersBase.metadata.create_all(bind=session_engine)
