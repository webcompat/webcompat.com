#!/usr/bin/python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import datetime
import hashlib
import hmac
from urllib.parse import urlencode
from xml.dom.minidom import parseString

import requests
from requests.exceptions import ConnectionError
from tools.topsites.utils import node_text

# Constant for alexa top site API
ATS_ACTION_NAME = 'TopSites'
ATS_ALGORITHM = 'AWS4-HMAC-SHA256'
ATS_COUNT = 100
ATS_DATEFORMAT_AWS = '%Y%m%dT%H%M%SZ'
ATS_DATEFORMAT_CREDENTIAL = '%Y%m%d'
ATS_HASH_ALGORITHM = 'HmacSHA256'
ATS_RESPONSE_GROUP_NAME = 'Country'
ATS_SERVICE_ENDPOINT = 'ats.us-west-1.amazonaws.com'
ATS_SERVICE_URI = '/api'
ATS_SERVICE_REGION = 'us-west-1'
ATS_SERVICE_NAME = 'AlexaTopSites'
ATS_SIGNED_HEADERS = 'host;x-amz-date'
ATS_AWS_BASE_URL = 'https://' + ATS_SERVICE_ENDPOINT + ATS_SERVICE_URI


class Alexa:
    def __init__(self, access_key, secret_key):
        self.ats_access_key = access_key
        self.ats_secret_key = secret_key

    def build_query_string(self, country_code, start_ranking):
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

    def get_sign_key(self, key, datestamp, region_name, service_name):
        """AWS sign key from key, datestamp, region and service."""
        date = self.gen_sign(('AWS4' + key).encode('utf-8'), datestamp)
        region = self.gen_sign(date, region_name)
        service = self.gen_sign(region, service_name)
        sign_key = self.gen_sign(service, 'aws4_request')
        return sign_key

    def get_sha256_hex(self, data):
        """Compute the hash as hex."""
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

    def gen_sign(self, key, data):
        """Compute RFC 2104-compliant HMAC signature."""
        return hmac.new(key, data.encode('utf-8'), hashlib.sha256).digest()

    def gen_sign_hex(self, key, data):
        """Compute RFC 2104-compliant HMAC signature."""
        return hmac.new(key, data.encode('utf-8'), hashlib.sha256).hexdigest()

    def build_request(self, country_code, start_ranking):
        """Build Alexa top site URI with given country code and start ranking."""
        # Prepare timestamp & datestamp
        nowtime = datetime.datetime.utcnow()
        timestamp = nowtime.strftime(ATS_DATEFORMAT_AWS)
        datestamp = nowtime.strftime(ATS_DATEFORMAT_CREDENTIAL)

        # Build request
        canonical_query = self.build_query_string(country_code, start_ranking)
        canonical_headers = """host:{host}
x-amz-date:{amzdate}
""".format(
            host=ATS_SERVICE_ENDPOINT,
            amzdate=timestamp)
        payload_hash = self.get_sha256_hex('')

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
            sha_request=self.get_sha256_hex(canonical_request))

        # Calculate signature
        key = self.get_sign_key(
            self.ats_secret_key, datestamp, ATS_SERVICE_REGION, ATS_SERVICE_NAME)
        signature = self.gen_sign_hex(key, to_sign)

        uri = '{base}?{query}'.format(
            base=ATS_AWS_BASE_URL,
            query=canonical_query)

        authorization_template = '{algorithm} Credential={access_key}/{scope}, SignedHeaders={signed_headers}, Signature={signature}'  # noqa
        authorization = authorization_template.format(
            algorithm=ATS_ALGORITHM,
            access_key=self.ats_access_key,
            scope=credential_scope,
            signed_headers=ATS_SIGNED_HEADERS,
            signature=signature)

        return uri, authorization, timestamp

    def query_topsites(self, country_code):
        """Query top 100 sites for given country code."""
        uri, authorization, timestamp = self.build_request(country_code, 1)
        print(uri, authorization, timestamp)
        try:
            headers = {'x-amz-date': timestamp, 'Authorization': authorization}
            response = requests.get(uri, headers=headers)
            response.raise_for_status()

            dom = parseString(response.content)

            if response.status_code == 200:
                # See https://docs.aws.amazon.com/AlexaTopSites/latest/QUERY_QueryRequests.html  # noqa
                sites = dom.getElementsByTagName('aws:Site')
                return sites
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
