#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for sending out error emails.'''

from flask.ext.mail import Message
import unittest
import os.path
import sys

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat


class TestMail(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()

    def tearDown(self):
        pass

    def test_sending_mail(self):
        '''Test that we can send an email.'''
        with webcompat.app.app_context():
            with webcompat.mail.record_messages() as outbox:
                webcompat.mail.send_message(subject='Testing',
                                            body='Test email.',
                                            recipients=["nobody@webcompat.com"])
                self.assertEqual(len(outbox), 1)
                self.assertEqual(outbox[0].subject, "Testing")

if __name__ == '__main__':
    unittest.main()
