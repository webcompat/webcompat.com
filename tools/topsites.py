#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
"""GitHub Webhook module for assigning priority to sites."""

import datetime
import hashlib
import hmac
import os
import sys
import time
from urllib.parse import urlencode
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
ATS_ALGORITHM = 'AWS4-HMAC-SHA256'
ATS_COUNT = 100
ATS_DATEFORMAT_AWS = '%Y%m%dT%H%M%SZ'
ATS_DATEFORMAT_CREDENTIAL = '%Y%m%d'
ATS_HASH_ALGORITHM = 'HmacSHA256'
ATS_RESPONSE_GROUP_NAME = 'Country'
ATS_SERVICE_HOST = 'ats.amazonaws.com'
ATS_SERVICE_ENDPOINT = 'ats.us-west-1.amazonaws.com'
ATS_SERVICE_URI = '/api'
ATS_SERVICE_REGION = 'us-west-1'
ATS_SERVICE_NAME = 'AlexaTopSites'
ATS_SIGNED_HEADERS = 'host;x-amz-date'
ATS_AWS_BASE_URL = 'https://' + ATS_SERVICE_HOST + ATS_SERVICE_URI

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
        uri, authorization, timestamp = build_request(country_code, index)
        try:
            headers = {'x-amz-date': timestamp, 'Authorization': authorization}
            response = requests.get(uri, headers=headers)
            dom = parseString(response.content)

            if response.status_code == 200:
                # See https://docs.aws.amazon.com/AlexaTopSites/latest/QUERY_QueryRequests.html  # noqa
                sites = dom.getElementsByTagName('aws:Site')
                for site in sites:
                    parse_site(site, country_code)
                session.commit()
            else:
                # Get error code and message from response
                # See https://docs.aws.amazon.com/AlexaTopSites/latest/Authentication.html  # noqa
                message = node_text(dom, 'aws:ErrorCode')
                error_template = """Send request to {uri} get error message:
                {message}"""
                print((error_template.format(
                      uri, message)))
        except ConnectionError:
            print(('Unable send request to {}'.format(uri)))


def parse_site(site, country_code):
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


def build_request(country_code, start_ranking):
    """Build Alexa top site URI with given country code and start ranking."""
    # Prepare timestamp & datestamp
    nowtime = datetime.datetime.utcnow()
    timestamp = nowtime.strftime(ATS_DATEFORMAT_AWS)
    datestamp = nowtime.strftime(ATS_DATEFORMAT_CREDENTIAL)

    # Build request
    canonical_query = build_query_string(country_code, start_ranking)
    canonical_headers = """host:{host}
x-amz-date:{amzdate}
""".format(
        host=ATS_SERVICE_ENDPOINT,
        amzdate=timestamp)
    payload_hash = get_sha256_hex('')

    request_template = """GET
{service_uri}
{query}
{headers}
{signed_headers}
{payload_hash}"""
    canonical_request = request_template.format(
        service_uri=ATS_SERVICE_URI,
        query=canonical_query,
        headers=canonical_headers,
        signed_headers=ATS_SIGNED_HEADERS,
        payload_hash=payload_hash)

    # Create string to sign from request
    credential_scope = '{dt}/{region}/{name}/aws4_request'.format(
        dt=datestamp,
        region=ATS_SERVICE_REGION,
        name=ATS_SERVICE_NAME)
    to_sign = """{algorithm}
{timestamp}
{scope}
{sha_request}""".format(
        algorithm=ATS_ALGORITHM,
        timestamp=timestamp,
        scope=credential_scope,
        sha_request=get_sha256_hex(canonical_request))

    # Calculate signature
    key = get_sign_key(
        ats_secret_key, datestamp, ATS_SERVICE_REGION, ATS_SERVICE_NAME)
    signature = gen_sign_hex(key, to_sign)

    uri = '{base}?{query}'.format(
        base=ATS_AWS_BASE_URL,
        query=canonical_query)

    authorization_template = '{algorithm} Credential={access_key}/{scope}, SignedHeaders={signed_headers}, Signature={signature}'  # noqa
    authorization = authorization_template.format(
        algorithm=ATS_ALGORITHM,
        access_key=ats_access_key,
        scope=credential_scope,
        signed_headers=ATS_SIGNED_HEADERS,
        signature=signature)

    return uri, authorization, timestamp


def build_query_string(country_code, start_ranking):
    """Build query string for request with start ranking and count."""
    # Alexa top site only accept request with ordered query parameters
    # Keep the order!
    query_params = [
        ('Action', ATS_ACTION_NAME),
        ('Count', ATS_COUNT),
        ('CountryCode', country_code),
        ('ResponseGroup', ATS_RESPONSE_GROUP_NAME),
        ('Start', start_ranking)]
    return urlencode(query_params)


def get_sign_key(key, datestamp, region_name, service_name):
    """AWS sign key from key, datestamp, region and service."""
    date = gen_sign(('AWS4' + key).encode('utf-8'), datestamp)
    region = gen_sign(date, region_name)
    service = gen_sign(region, service_name)
    sign_key = gen_sign(service, 'aws4_request')
    return sign_key


def get_sha256_hex(data):
    """Compute the hash as hex."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()


def gen_sign(key, data):
    """Compute RFC 2104-compliant HMAC signature."""
    return hmac.new(key, data.encode('utf-8'), hashlib.sha256).digest()


def gen_sign_hex(key, data):
    """Compute RFC 2104-compliant HMAC signature."""
    return hmac.new(key, data.encode('utf-8'), hashlib.sha256).hexdigest()


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
    if os.path.isfile(os.path.join(DB_PATH, 'topsites.db')):
        os.rename(os.path.join(DB_PATH, 'topsites.db'),
                  os.path.join(DB_PATH,
                               'topsites-archive-{}.db'.format(archive_date)))
    os.rename(os.path.join(DB_PATH, 'topsites-new.db'),
              os.path.join(DB_PATH, 'topsites.db'))
