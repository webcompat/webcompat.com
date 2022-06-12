#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Database initialization."""

from hashlib import sha512
import os
from uuid import uuid4

from sqlalchemy import Column
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Integer
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import String

from webcompat import app
from webcompat.helpers import to_bytes

session_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'session.db'))
session_db = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=session_engine))

global_site_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'topsites-global.db'))
global_site_db = scoped_session(sessionmaker(autocommit=False,
                                autoflush=False,
                                bind=global_site_engine))


regional_site_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'topsites-regional.db'))
regional_site_db = scoped_session(sessionmaker(autocommit=False,
                                  autoflush=False,
                                  bind=regional_site_engine))

site_nsfw_engine = create_engine('sqlite:///' + os.path.join(
    app.config['DATA_PATH'], 'site-nsfw.db'))
site_nsfw_db = scoped_session(sessionmaker(autocommit=False,
                                           autoflush=False,
                                           bind=site_nsfw_engine))


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
        self.user_id = sha512(
            to_bytes(access_token + uuid4().hex)).hexdigest()[0:128]


UsersBase.metadata.create_all(bind=session_engine)

GlobalSiteBase = declarative_base()
GlobalSiteBase.query = global_site_db.query_property()


class SiteGlobal(GlobalSiteBase):
    """SQLAchemy base object for Tranco top site."""

    __tablename__ = "topsites-global"

    url = Column(String, primary_key=True)
    priority = Column(Integer)
    ranking = Column(Integer)

    def __init__(self, url, ranking, priority):
        """Initialize parameters of the Tranco top site DB."""
        self.url = url
        self.ranking = ranking
        self.priority = priority


GlobalSiteBase.metadata.create_all(bind=global_site_engine)


RegionalSiteBase = declarative_base()
RegionalSiteBase.query = regional_site_db.query_property()


class SiteRegional(RegionalSiteBase):
    """SQLAchemy base object for an Alexa top site per region."""

    __tablename__ = "topsites-regional"

    url = Column(String, primary_key=True)
    priority = Column(Integer)
    country_code = Column(String)
    ranking = Column(Integer)

    def __init__(self, url, priority, country_code, ranking):
        """Initialize parameters of the Alexa regional top site DB."""
        self.url = url
        self.priority = priority
        self.country_code = country_code
        self.ranking = ranking


RegionalSiteBase.metadata.create_all(bind=regional_site_engine)


SiteNSFWBase = declarative_base()
SiteNSFWBase.query = site_nsfw_db.query_property()


class SiteNSFW(SiteNSFWBase):
    """Define the DB for NSFW domains."""

    __tablename__ = 'site-nsfw'

    url = Column(String, primary_key=True)

    def __init__(self, url):
        """Initialize parameters of the NSFW domains DB."""
        self.url = url


SiteNSFWBase.metadata.create_all(bind=site_nsfw_engine)
