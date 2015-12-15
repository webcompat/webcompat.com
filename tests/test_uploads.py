#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for image upload API endpoint.'''

import os.path
import sys
import unittest

from flask import Request
from flaskext.uploads import TestingFileStorage
from StringIO import StringIO
from werkzeug import FileStorage
from werkzeug.datastructures import MultiDict

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))

from webcompat import app


class TestUploads(unittest.TestCase):
    # modified from http://prschmid.blogspot.com/2013/05/unit-testing-flask-file-uploads-without.html  # nopep8
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app
        self.test_client = self.app.test_client()

    def tearDown(self):
        pass

    def testGet(self):
        '''Test that /upload/ doesn't let you GET.'''
        rv = self.test_client.get('/upload/')
        self.assertEqual(rv.status_code, 404)

    def testBadUploads(self):
        # Loop over some files and the status codes that we are expecting
        for filename, status_code in (
                ('foo.xxx', 415),
                ('foo', 415),
                ('foo.rb', 415)):

            # The reason why we are defining it in here and not outside
            # this method is that we are setting the filename of the
            # TestingFileStorage to be the one in the for loop. This way
            # we can ensure that the filename that we are "uploading"
            # is the same as the one being used by the application
            class TestingRequest(Request):
                """A testing request to use that will return a
                TestingFileStorage to test the uploading."""
                @property
                def files(self):
                    d = MultiDict()
                    d['image'] = TestingFileStorage(filename=filename)
                    return d

            self.app.request_class = TestingRequest
            test_client = self.app.test_client()

            rv = test_client.post(
                '/upload/',
                data=dict(
                    file=(StringIO('Fake image data'), filename),
                ))
            self.assertEqual(rv.status_code, status_code)

    def testGoodUploads(self):
        # Loop over some files and the URLs that we are expecting back
        for filename, status_code in (
                ('foo.png', 201),
                ('foo.jpg', 201),
                ('foo.gif', 201),
                ('foo.jpe', 201),
                ('foo.jpeg', 201),
                ('foo.bmp', 201)):

            class TestingRequest(Request):
                """A testing request to use that will return a
                TestingFileStorage to test the uploading."""
                @property
                def files(self):
                    d = MultiDict()
                    d['image'] = TestingFileStorage(filename=filename)
                    return d

            self.app.request_class = TestingRequest
            test_client = self.app.test_client()

            rv = test_client.post(
                '/upload/',
                data=dict(
                    file=(StringIO('Fake image data'), filename),
                ))
            self.assertEqual(rv.status_code, status_code)

if __name__ == '__main__':
    unittest.main()
