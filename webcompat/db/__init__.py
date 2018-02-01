#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Database initialization."""

from hashlib import sha512
import os
from uuid import uuid4

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Integer
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import String

from webcompat import app

# Sessions database for logged in users
session_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'session.db'))
session_db = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=session_engine))

# Amazon Top Sites priority ranking database
site_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'topsites.db'))
site_db = scoped_session(sessionmaker(autocommit=False,
                                      autoflush=False,
                                      bind=site_engine))

# Issues database
issues_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'issues.db'))
issues_db = scoped_session(sessionmaker(autocommit=False,
                                        autoflush=False,
                                        bind=issues_engine))

# Sessions DB initialization
UsersBase = declarative_base()
UsersBase.query = session_db.query_property()


class User(UsersBase):
    """Define the user DB holding the sessions."""

    __tablename__ = 'users'

    user_id = Column(String(128), unique=True, primary_key=True)
    access_token = Column(String(128), unique=True)

    def __init__(self, access_token):
        """Initialize the user db parameters."""
        self.access_token = access_token
        # We use the user_id in the session cookie to identify auth'd users.
        # Here we salt and hash the GitHub access token so you can't get
        # back to the auth token if the session cookie was ever compromised.
        self.user_id = sha512(access_token + uuid4().hex).hexdigest()[0:128]


UsersBase.metadata.create_all(bind=session_engine)

# Topsites DB initialization
SiteBase = declarative_base()
SiteBase.query = site_db.query_property()


class Site(SiteBase):
    """SQLAchemy base object for an Alexa top site."""

    __tablename__ = 'topsites'

    url = Column(String, primary_key=True)
    priority = Column(Integer)
    country_code = Column(String)
    ranking = Column(Integer)

    def __init__(self, url, priority, country_code, ranking):
        """Initialize the topsite db parameters."""
        self.url = url
        self.priority = priority
        self.country_code = country_code
        self.ranking = ranking

SiteBase.metadata.create_all(bind=site_engine)


# Issues DB initialization
IssuesBase = declarative_base()
IssuesBase.query = issues_db.query_property()


class Issues(IssuesBase):
    """SQLAchemy base object for Issues."""

    __tablename__ = 'issues'

    issue_number = Column(Integer, primary_key=True)
    title = Column(String)
    is_issue = Column(Boolean, default=True)

    def __init__(self, issue_number, title, is_issue):
        """Initialize the topsite db parameters."""
        self.issue_number = issue_number
        self.title = title
        self.is_issue = is_issue

IssuesBase.metadata.create_all(bind=issues_engine)
