#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for topsites script."""

import datetime
import unittest
from xml.dom.minidom import parseString

from mock import patch

from tools import topsites


TEST_XML = '''<?xml version="1.0"?><aws:TopSitesResponse xmlns:aws="http://alexa.amazonaws.com/doc/2005-10-05/"><aws:Response><aws:OperationRequest><aws:RequestId>9ffc5e13-175e-4c7e-b33b-0efe3501d1f3</aws:RequestId></aws:OperationRequest><aws:TopSitesResult><aws:Alexa><aws:TopSites><aws:List><aws:CountryName>China</aws:CountryName><aws:CountryCode>CN</aws:CountryCode><aws:TotalSites>671496</aws:TotalSites><aws:Sites><aws:Site><aws:DataUrl>baidu.com</aws:DataUrl><aws:Country><aws:Rank>1</aws:Rank><aws:Reach><aws:PerMillion>358000</aws:PerMillion></aws:Reach><aws:PageViews><aws:PerMillion>77410</aws:PerMillion><aws:PerUser>11.5</aws:PerUser></aws:PageViews></aws:Country><aws:Global><aws:Rank>4</aws:Rank></aws:Global></aws:Site></aws:Sites></aws:List></aws:TopSites></aws:Alexa></aws:TopSitesResult><aws:ResponseStatus><aws:StatusCode>Success</aws:StatusCode></aws:ResponseStatus></aws:Response></aws:TopSitesResponse>'''  # nopep8
TEST_QUERY_STRING = 'Action=TopSites&Count=100&CountryCode=CN&ResponseGroup=Country&Start=1'  # nopep8
TEST_QUERY_URI = 'https://ats.amazonaws.com/api?Action=TopSites&Count=100&CountryCode=CN&ResponseGroup=Country&Start=1'  # nopep8
TEST_QUERY_AUTH = 'AWS4-HMAC-SHA256 Credential=1234567890ABCDEFGHIJ/20060101/us-west-1/AlexaTopSites/aws4_request, SignedHeaders=host;x-amz-date, Signature=55b760bcae9a2ae93b0d08a85c3e613ec43c7f39f69ef2345896cf7660234f49'  # nopep8
TEST_QUERY_TIMESTAMP = '20060101T000000Z'


class TestTopsites(unittest.TestCase):
    """Tests for Top Sites Tools."""

    def setUp(self):
        """Set up the tests."""
        self.dom = parseString(TEST_XML)
        topsites.ats_access_key = '1234567890ABCDEFGHIJ'
        topsites.ats_secret_key = 'JIHGFEDCBA0987654321'

    def test_build_request(self):
        """Build a request."""
        testdt = datetime.datetime(2006, 1, 1, 0, 0, 0, 0)
        with patch('datetime.datetime') as dt_mock:
            dt_mock.utcnow.return_value = testdt
            uri, authorization, timestamp = topsites.build_request('CN', 1)
            self.assertEqual(uri, TEST_QUERY_URI)
            self.assertEqual(authorization, TEST_QUERY_AUTH)
            self.assertEqual(timestamp, TEST_QUERY_TIMESTAMP)

    def test_build_query_string(self):
        """Build a Query String."""
        testdt = datetime.datetime(2006, 1, 1, 0, 0, 0, 0)
        with patch('datetime.datetime') as dt_mock:
            dt_mock.utcnow.return_value = testdt
            self.assertEqual(topsites.build_query_string('CN', 1),
                             TEST_QUERY_STRING)

    def test_node_text(self):
        """Extract text from a node."""
        site = self.dom.getElementsByTagName('aws:Site')[0]
        self.assertEqual(topsites.node_text(site, 'aws:DataUrl'), 'baidu.com')
        self.assertEqual(topsites.node_text(site, 'aws:Rank'), '1')


if __name__ == '__main__':
    unittest.main()
