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
from io import BytesIO
from werkzeug import FileStorage
from werkzeug.datastructures import MultiDict

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))

from webcompat import app


class TestingFileStorage(FileStorage):
    """
    This is a helper for testing upload behavior in your application. You
    can manually create it, and its save method is overloaded to set `saved`
    to the name of the file it was saved to. All of these parameters are
    optional, so only bother setting the ones relevant to your application.

    :param stream: A stream. The default is an empty stream.
    :param filename: The filename uploaded from the client. The default is the
                     stream's name.
    :param name: The name of the form field it was loaded from. The default is
                 `None`.
    :param content_type: The content type it was uploaded as. The default is
                         ``application/octet-stream``.
    :param content_length: How long it is. The default is -1.
    :param headers: Multipart headers as a `werkzeug.Headers`. The default is
                    `None`.

    taken from https://github.com/srusskih/flask-uploads/blob/master/flaskext/uploads.py#L476 # nopep8
    """
    def __init__(self, stream=None, filename=None, name=None,
                 content_type='application/octet-stream', content_length=-1,
                 headers=None):
        FileStorage.__init__(self, stream, filename, name=name,
                             content_type=content_type,
                             content_length=content_length, headers=None)
        self.saved = None

    def save(self, dst, buffer_size=16384):
        """
        This marks the file as saved by setting the `saved` attribute to the
        name of the file it was saved to.

        :param dst: The file to save to.
        :param buffer_size: Ignored.
        """
        if isinstance(dst, str):
            self.saved = dst
        else:
            self.saved = dst.name


class TestUploads(unittest.TestCase):
    '''Modified from http://prschmid.blogspot.com/2013/05/unit-testing-flask-file-uploads-without.html  # nopep8'''

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

    def testRegularUploads(self):
        # Loop over some files and the status codes that we are expecting
        # Basically it should never be possible to upload a "regular" file.
        for filename, status_code in (
                ('evil.py', 415),
                ('evil', 415),
                ('evil.png', 415),
                ('green_square.webp', 415),
                ('green_square.png', 201),
                ('green_square.jpg', 201),
                ('green_square.gif', 201),
                ('green_square.bmp', 201)):

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
                    f = open(os.path.join('tests', 'fixtures', filename), 'rb')
                    d['image'] = TestingFileStorage(stream=BytesIO(f.read()),
                                                    filename=filename)
                    f.close()
                    return d

            self.app.request_class = TestingRequest
            test_client = self.app.test_client()

            rv = test_client.post('/upload/', data=dict())
            self.assertEqual(rv.status_code, status_code)

    def testBase64ScreenshotUploads(self):
        BASE64_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg=='  # nopep8
        BASE64_PNG_GARBAGE = 'data:image/png;base64,garbage!'
        BASE64_PNG_GARBAGE2 = 'data:image/png;data:image/png;'
        PILE_OF_POO = '💩'

        for filedata, status_code in (
                (BASE64_PNG, 201),
                (BASE64_PNG_GARBAGE, 415),
                (BASE64_PNG_GARBAGE2, 415),
                (PILE_OF_POO, 415)):

            class TestingRequest(Request):
                """A testing request to use that allows us to manipulate
                request.form to send screenshot data.
                """
                @property
                def form(self):
                    d = MultiDict()
                    d['image'] = filedata
                    return d

            self.app.request_class = TestingRequest
            test_client = self.app.test_client()

            rv = test_client.post('/upload/', data=dict())
            self.assertEqual(rv.status_code, status_code)


if __name__ == '__main__':
    unittest.main()
