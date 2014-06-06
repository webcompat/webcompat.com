#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for filtering results from API calls.'''

import unittest
import os.path
import sys

# Add webcompat module to import path
sys.path.append(os.path.realpath(os.pardir))
import webcompat
from webcompat.issues import filter_needs_diagnosis, add_status_class

ISSUES = [
    {u'body': u'<!-- @browser: Firefox -->\n\n**URL**: www.internet.biz\n**Browser**: Firefox\n**Version**: 32.0\n**Problem type**: Unknown\n**Site owner**: Unknown\n\n**Steps to Reproduce**\n1) Navigate to: www.internet.biz\r\n2) \u2026\r\n\r\nExpected Behavior:\r\nActual Behavior:\r\n',
     u'labels': [
      {u'url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/labels/contactready', u'color': u'eb6420', u'name': u'contactready'},
      {u"url": u"https://api.github.com/repos/webcompat/web-bugs/labels/firefox", u"name": u"firefox",u"color": u"eb6420"}],
     u'title': u'Site is confusing', u'url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50', u'labels_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/labels{/name}', u'created_at': u'2014-05-27T20:24:51Z', u'events_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/events', u'comments_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/comments', u'html_url': u'https://github.com/miketaylr/nobody-look-at-this/issues/50', u'comments': 0, u'number': 50, u'updated_at': u'2014-05-27T21:54:00Z', u'assignee': None, u'state': u'open', u'user': {u'following_url': u'https://api.github.com/users/miketaylr/following{/other_user}', u'events_url': u'https://api.github.com/users/miketaylr/events{/privacy}', u'organizations_url': u'https://api.github.com/users/miketaylr/orgs', u'url': u'https://api.github.com/users/miketaylr', u'gists_url': u'https://api.github.com/users/miketaylr/gists{/gist_id}', u'html_url': u'https://github.com/miketaylr', u'subscriptions_url': u'https://api.github.com/users/miketaylr/subscriptions', u'avatar_url': u'https://avatars.githubusercontent.com/u/67283?', u'repos_url': u'https://api.github.com/users/miketaylr/repos', u'received_events_url': u'https://api.github.com/users/miketaylr/received_events', u'gravatar_id': u'929d3002e426ec2e88d89637d3f5f8ba', u'starred_url': u'https://api.github.com/users/miketaylr/starred{/owner}{/repo}', u'site_admin': False, u'login': u'miketaylr', u'type': u'User', u'id': 67283, u'followers_url': u'https://api.github.com/users/miketaylr/followers'}, u'milestone': None, u'closed_at': None, u'id': 34409616},
    {u'body': u'<!-- @browser: Firefox -->\n\n**URL**: www.internet.biz\n**Browser**: Firefox\n**Version**: 32.0\n**Problem type**: Unknown\n**Site owner**: Unknown\n\n**Steps to Reproduce**\n1) Navigate to: www.internet.biz\r\n2) \u2026\r\n\r\nExpected Behavior:\r\nActual Behavior:\r\n',
     u'labels': [{u"url": u"https://api.github.com/repos/webcompat/web-bugs/labels/firefox", u"name": u"firefox",u"color": u"eb6420"}],
     u'title': u'Site is confusing', u'url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50', u'labels_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/labels{/name}', u'created_at': u'2014-05-27T20:24:51Z', u'events_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/events', u'comments_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/comments', u'html_url': u'https://github.com/miketaylr/nobody-look-at-this/issues/50', u'comments': 0, u'number': 50, u'updated_at': u'2014-05-27T21:54:00Z', u'assignee': None, u'state': u'open', u'user': {u'following_url': u'https://api.github.com/users/miketaylr/following{/other_user}', u'events_url': u'https://api.github.com/users/miketaylr/events{/privacy}', u'organizations_url': u'https://api.github.com/users/miketaylr/orgs', u'url': u'https://api.github.com/users/miketaylr', u'gists_url': u'https://api.github.com/users/miketaylr/gists{/gist_id}', u'html_url': u'https://github.com/miketaylr', u'subscriptions_url': u'https://api.github.com/users/miketaylr/subscriptions', u'avatar_url': u'https://avatars.githubusercontent.com/u/67283?', u'repos_url': u'https://api.github.com/users/miketaylr/repos', u'received_events_url': u'https://api.github.com/users/miketaylr/received_events', u'gravatar_id': u'929d3002e426ec2e88d89637d3f5f8ba', u'starred_url': u'https://api.github.com/users/miketaylr/starred{/owner}{/repo}', u'site_admin': False, u'login': u'miketaylr', u'type': u'User', u'id': 67283, u'followers_url': u'https://api.github.com/users/miketaylr/followers'}, u'milestone': None, u'closed_at': None, u'id': 34409616},
    {u'body': u'<!-- @browser: Firefox -->\n\n**URL**: www.internet.biz\n**Browser**: Firefox\n**Version**: 32.0\n**Problem type**: Unknown\n**Site owner**: Unknown\n\n**Steps to Reproduce**\n1) Navigate to: www.internet.biz\r\n2) \u2026\r\n\r\nExpected Behavior:\r\nActual Behavior:\r\n',
     u'labels': [{u'url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/labels/contactready', u'color': u'eb6420', u'name': u'contactready'}],
     u'title': u'Site is confusing', u'url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50', u'labels_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/labels{/name}', u'created_at': u'2014-05-27T20:24:51Z', u'events_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/events', u'comments_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/comments', u'html_url': u'https://github.com/miketaylr/nobody-look-at-this/issues/50', u'comments': 0, u'number': 50, u'updated_at': u'2014-05-27T21:54:00Z', u'assignee': None, u'state': u'open', u'user': {u'following_url': u'https://api.github.com/users/miketaylr/following{/other_user}', u'events_url': u'https://api.github.com/users/miketaylr/events{/privacy}', u'organizations_url': u'https://api.github.com/users/miketaylr/orgs', u'url': u'https://api.github.com/users/miketaylr', u'gists_url': u'https://api.github.com/users/miketaylr/gists{/gist_id}', u'html_url': u'https://github.com/miketaylr', u'subscriptions_url': u'https://api.github.com/users/miketaylr/subscriptions', u'avatar_url': u'https://avatars.githubusercontent.com/u/67283?', u'repos_url': u'https://api.github.com/users/miketaylr/repos', u'received_events_url': u'https://api.github.com/users/miketaylr/received_events', u'gravatar_id': u'929d3002e426ec2e88d89637d3f5f8ba', u'starred_url': u'https://api.github.com/users/miketaylr/starred{/owner}{/repo}', u'site_admin': False, u'login': u'miketaylr', u'type': u'User', u'id': 67283, u'followers_url': u'https://api.github.com/users/miketaylr/followers'}, u'milestone': None, u'closed_at': '2014-05-27T22:54:00Z', u'id': 34409616},
     {u'body': u'<!-- @browser: Firefox -->\n\n**URL**: www.isdfdfnternet.biz\n**Browser**: Firefox\n**Version**: 32.0\n**Problem type**: Unknown\n**Site owner**: Unknown\n\n**Steps to Reproduce**\n1) Navigate to: www.internet.biz\r\n2) \u2026\r\n\r\nExpected Behavior:\r\nActual Behavior:\r\n',
     u'labels': [],
     u'title': u'Site is confusing', u'url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50', u'labels_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/labels{/name}', u'created_at': u'2014-05-27T20:24:51Z', u'events_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/events', u'comments_url': u'https://api.github.com/repos/miketaylr/nobody-look-at-this/issues/50/comments', u'html_url': u'https://github.com/miketaylr/nobody-look-at-this/issues/50', u'comments': 0, u'number': 50, u'updated_at': u'2014-05-27T21:54:00Z', u'assignee': None, u'state': u'open', u'user': {u'following_url': u'https://api.github.com/users/miketaylr/following{/other_user}', u'events_url': u'https://api.github.com/users/miketaylr/events{/privacy}', u'organizations_url': u'https://api.github.com/users/miketaylr/orgs', u'url': u'https://api.github.com/users/miketaylr', u'gists_url': u'https://api.github.com/users/miketaylr/gists{/gist_id}', u'html_url': u'https://github.com/miketaylr', u'subscriptions_url': u'https://api.github.com/users/miketaylr/subscriptions', u'avatar_url': u'https://avatars.githubusercontent.com/u/67283?', u'repos_url': u'https://api.github.com/users/miketaylr/repos', u'received_events_url': u'https://api.github.com/users/miketaylr/received_events', u'gravatar_id': u'929d3002e426ec2e88d89637d3f5f8ba', u'starred_url': u'https://api.github.com/users/miketaylr/starred{/owner}{/repo}', u'site_admin': False, u'login': u'miketaylr', u'type': u'User', u'id': 67283, u'followers_url': u'https://api.github.com/users/miketaylr/followers'}, u'milestone': None, u'closed_at': '2014-05-27T22:54:00Z', u'id': 34409616}
    ]


class TestStatusClass(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()
        self.issues = ISSUES

    def tearDown(self):
        pass

    def test_add_status_class(self):
        add_status_class(self.issues)
        self.assertEqual(self.issues[0]["status_class"], 'issue-contactready')
        self.assertEqual(self.issues[1]["status_class"],
                         'issue-needs-diagnosis')
        self.assertEqual(self.issues[2]["status_class"], 'issue-closed')


class TestFilterNeedsDiagnosis(unittest.TestCase):
    def setUp(self):
        webcompat.app.config['TESTING'] = True
        self.app = webcompat.app.test_client()
        self.issues = ISSUES

    def tearDown(self):
        pass

    def test_filter(self):
        filtered = filter_needs_diagnosis(self.issues)
        self.assertEqual(len(filtered), 2)
        self.assertIsInstance(filtered[0], dict)


if __name__ == '__main__':
    unittest.main()
