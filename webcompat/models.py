#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from webcompat import engine

db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    # Current Github username limit is 39 chars
    # Let's assume it might change in the future?
    username = Column(String(64))
    avatar_url = Column(String(128))
    github_access_token = Column(String(128), unique=True)

    def __init__(self, github_access_token, username='', avatar_url=''):
        self.github_access_token = github_access_token
        self.username = username
        self.avatar_url = avatar_url


Base.metadata.create_all(bind=engine)
