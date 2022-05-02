#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
import os
import time

from sqlalchemy import Column
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Integer
from sqlalchemy.orm import scoped_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import String

cwd = os.getcwd()
DATA_PATH = os.path.join(cwd, 'data')

site_global_engine = create_engine('sqlite:///' + os.path.join(DATA_PATH, 'topsites-global-new.db'))
site_global_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=site_global_engine))
SiteGlobalBase = declarative_base()


class SiteGlobal(SiteGlobalBase):
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


SiteGlobalBase.metadata.create_all(bind=site_global_engine)

site_regional_engine = create_engine('sqlite:///' + os.path.join(DATA_PATH, 'topsites-regional-new.db'))
site_regional_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=site_regional_engine))
SiteRegionalBase = declarative_base()


class SiteRegional(SiteRegionalBase):
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


SiteRegionalBase.metadata.create_all(bind=site_regional_engine)


class SiteRank:
    def __init__(self) -> None:
        self.sites_global = {}
        self.sites_regional = {}

    def get_priority(self, rank: int, priority: int) -> int:
        if 100 < rank <= 1000:
            priority += 1
        elif 1000 < rank <= 10000:
            priority += 2

        return priority

    def save_global_rank(self, url: str, rank: int) -> SiteGlobal:
        priority = self.get_priority(rank, 1)
        site_row = SiteGlobal(url, rank, priority)
        site_global_session.add(site_row)
        self.sites_global[url] = site_row
        return site_row

    def save_regional_rank(self, url: str, rank: int, country_code: str) -> SiteRegional:
        """Compare site rank in global cache and save results to db."""
        priority = self.get_priority(rank, 2)
        site_regional = None

        if url in self.sites_global:
            # If regional priority of the domain is lower than the global one,
            # (site is more important in a given region than globally)
            # store it in the regional db and in cache
            site_global = self.sites_global[url]
            if priority < site_global.priority and url not in self.sites_regional:
                site_regional = SiteRegional(url, priority, country_code, rank)
                site_regional_session.add(site_regional)

                self.sites_regional[url] = site_regional
        else:
            # URL not cached in global, create SiteRegional object and save it in db and cache
            site_regional = SiteRegional(url, priority, country_code, rank)
            site_regional_session.add(site_regional)

            self.sites_regional[url] = site_regional

        # If site already exists in regional db and new priority is lower (i.e. it is more important), update it
        if url in self.sites_regional:
            site_regional = self.sites_regional[url]
            if priority < site_regional.priority:
                site_regional.priority = priority
                site_regional.country_code = country_code
                site_regional.ranking = rank

        return site_regional

    def commit_regional(self) -> None:
        site_regional_session.commit()
        site_regional_session.close()

    def commit_global(self) -> None:
        site_global_session.commit()
        site_global_session.close()

    def cleanup_db(self, to_update_regional: str) -> None:
        """Delete temporary DBs."""
        archive_date = time.strftime("%Y%m%d", time.localtime())
        if os.path.isfile(os.path.join(DATA_PATH, 'topsites-global.db')):
            os.rename(os.path.join(DATA_PATH, 'topsites-global.db'),
                      os.path.join(DATA_PATH,
                                   'topsites-global-archive-{}.db'.format(archive_date)))
        os.rename(os.path.join(DATA_PATH, 'topsites-global-new.db'),
                  os.path.join(DATA_PATH, 'topsites-global.db'))

        if to_update_regional:
            if os.path.isfile(os.path.join(DATA_PATH, 'topsites-regional.db')):
                os.rename(os.path.join(DATA_PATH, 'topsites-regional.db'),
                          os.path.join(DATA_PATH,
                                       'topsites-regional-archive-{}.db'.format(archive_date)))
            os.rename(os.path.join(DATA_PATH, 'topsites-regional-new.db'),
                      os.path.join(DATA_PATH, 'topsites-regional.db'))

