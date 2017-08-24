#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""GitHub Webhook module for assigning priority to sites."""

import base64
import datetime
import hashlib
import hmac
import os
import sys
import time
from urllib import urlencode
from xml.dom.minidom import parseString

import requests
from requests.exceptions import ConnectionError
from sqlalchemy import Column
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Integer
from sqlalchemy.orm import sessionmaker
from sqlalchemy import String

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
from webcompat import app

# Constant for alexa top site API
ATS_ACTION_NAME = 'TopSites'
ATS_RESPONSE_GROUP_NAME = 'Country'
ATS_SERVICE_HOST = 'ats.amazonaws.com'
ATS_AWS_BASE_URL = 'http://' + ATS_SERVICE_HOST + '/?'
ATS_DATEFORMAT = '%Y-%m-%dT%H:%M:%S.%f'
ATS_HASH_ALGORITHM = 'HmacSHA256'
ATS_COUNT = 100

# Location of the DB and its backup.
DB_PATH = app.config['DATA_PATH']

# Regions to dump to topsites.db
REGIONS = ['GLOBAL', 'US', 'FR', 'IN', 'DE', 'TW', 'ID', 'HK', 'SG', 'PL',
           'GB', 'RU']

# Alexa top site access and secret key
ats_access_key = None
ats_secret_key = None


# Cache parsed sites, change priority if raised
topsites = {}

engine = create_engine('sqlite:///' + os.path.join(DB_PATH, 'topsites-new.db'))
Base = declarative_base()
Session = sessionmaker(bind=engine)
session = Session()


class Site(Base):
    """SQLAchemy base object for an Alexa top site."""

    __tablename__ = "topsites"

    url = Column(String, primary_key=True)
    priority = Column(Integer)
    country_code = Column(String)
    ranking = Column(Integer)

    def __init__(self, url, priority, country_code, ranking):
        """Initialize parameters of the Alexa top site DB."""
        self.url = url
        self.priority = priority
        self.country_code = country_code
        self.ranking = ranking


Base.metadata.create_all(engine)


def query_topsites(country_code, count=1000):
    """Query top sites with given country code and count."""
    for index in range(1, count, 100):
        uri = build_uri(country_code, index)
        try:
            response = requests.get(uri)
            dom = parseString(response.content)

            if response.status_code == 200:
                # See http://docs.aws.amazon.com/AlexaTopSites/latest/index.html?QUERY_QueryRequests.html  # nopep8
                sites = dom.getElementsByTagName('aws:Site')
                for site in sites:
                    parse_site(site)
                session.commit()
            else:
                # Get error code and message from response
                # See http://docs.aws.amazon.com/AlexaTopSites/latest/index.html?QUERY_QueryAuthenticationErrors.html  # nopep8
                code = node_text(dom, 'Code')
                message = node_text(dom, 'Message')
                print('Send request to {} get error: {}.\nMessage: {}'.format(
                      uri, code, message))
        except ConnectionError:
            print('Unable send request to {}'.format(uri))


def parse_site(site):
    """Parse given dom object."""
    url = node_text(site, 'aws:DataUrl')
    rank = int(node_text(site, 'aws:Rank'))

    # Global website, initial priority is 1
    # Tier 1 regions, initial priority is 2
    priority = 1 if country_code == '' else 2

    # Ranking between 100 and 1000, add priority 1
    # Ranking between 1000 and 10000, add priority 2
    if 100 < rank <= 1000:
        priority += 1
    elif 1000 < rank <= 10000:
        priority += 2

    if url not in topsites:
        # URL not cached, create Site object and put in topsites
        site_row = Site(url, priority, country_code, rank)
        topsites[url] = site_row
        session.add(site_row)
    else:
        site_row = topsites[url]
        # If priority of the URL is higher than cached one,
        # update new priority, country_code and ranking in cache
        if site_row.priority > priority:
            site_row.priority = priority
            site_row.country_code = country_code
            site_row.ranking = rank


def build_uri(country_code, start_ranking):
    """Build Alexa top site URI with given country code and start ranking."""
    # Build query string
    query_string = build_query_string(country_code, start_ranking)

    # String to sign
    to_sign = 'GET\n{}\n/\n{}'.format(ATS_SERVICE_HOST, query_string)
    signature = gen_sign(to_sign)

    # URI with signature
    uri = '{base}{query}&{signature}'.format(
        base=ATS_AWS_BASE_URL,
        query=query_string,
        signature=urlencode({"Signature": signature}, "UTF-8"))
    return uri


def build_query_string(country_code, start_ranking):
    """Build query string for request with start ranking and count."""
    nowtime = datetime.datetime.utcnow()
    timestamp = '{}Z'.format(nowtime.strftime(ATS_DATEFORMAT)[:-3])

    # Alexa top site only accept request with ordered query parameters
    # Keep the order!
    query_params = [
        ('Action', ATS_ACTION_NAME),
        ('AWSAccessKeyId', ats_access_key),
        ('Count', ATS_COUNT),
        ('CountryCode', country_code),
        ('ResponseGroup', ATS_RESPONSE_GROUP_NAME),
        ('SignatureMethod', ATS_HASH_ALGORITHM),
        ('SignatureVersion', 2),
        ('Start', start_ranking),
        ('Timestamp', timestamp)]
    return urlencode(query_params)


def gen_sign(data):
    """Compute RFC 2104-compliant HMAC signature."""
    dig = hmac.new(ats_secret_key, data, hashlib.sha256).digest()
    return base64.b64encode(dig)


def node_text(tree, tag_name):
    """Extract the text node in a tree for a specific tag_name.

    It will only work with unique text nodes.
    """
    node = tree.getElementsByTagName(tag_name)[0]
    return node.childNodes[0].data


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Usage: python topsites.py ACCESS_KEY_ID SECRET_ACCESS_KEY')
        sys.exit(1)

    ats_access_key = sys.argv[1]
    ats_secret_key = sys.argv[2]

    for country_code in REGIONS:
        if country_code == "GLOBAL":
            query_topsites("", 10000)  # Alexa use "" as global country code
        else:
            query_topsites(country_code=country_code)

    # Archive topsites.db and rename topsites-new.db to topsites.db
    session.close()
    archive_date = time.strftime("%Y%m%d", time.localtime())
    os.rename(os.path.join(DB_PATH, 'topsites.db'),
              os.path.join(DB_PATH,
                           'topsites-archive-{}.db'.format(archive_date)))
    os.rename(os.path.join(DB_PATH, 'topsites-new.db'),
              os.path.join(DB_PATH, 'topsites.db'))
