#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import datetime
import math
import urlparse

from babel.dates import format_timedelta
from flask import session
from ua_parser import user_agent_parser

from webcompat import app
from webcompat import github

JSON_MIME = 'application/json'


@app.template_filter('format_delta')
def format_delta_filter(timestamp):
    '''Jinja2 fiter to format a unix timestamp to a time delta string.'''
    delta = datetime.datetime.now() - datetime.datetime.fromtimestamp(timestamp)
    return format_timedelta(delta, locale='en_US')


def format_delta_seconds(timestamp):
    '''Return a timedelta by seconds.

    The timedelta is a negative float, so we round up the absolute value and
    cast it to an integer to be more human friendly.
    '''
    delta = datetime.datetime.now() - datetime.datetime.fromtimestamp(timestamp)
    seconds = delta.total_seconds()
    return abs(int(math.ceil(seconds)))


def get_user_info():
    '''Grab the username and avatar URL from GitHub.'''
    if session.get('username') and session.get('avatar_url'):
        return
    else:
        gh_user = github.get('user')
        session['username'] = gh_user.get('login')
        session['avatar_url'] = gh_user.get('avatar_url')


def get_browser_name(user_agent_string):
    '''Return just the browser name.

    unknown user agents will be reported as "other".
    '''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    name = ua_dict.get('user_agent').get('family').lower()
    if (name == 'firefox mobile' and
            ua_dict.get('os').get('family') == 'Firefox OS'):
        name = 'other'
    return name


def get_browser(user_agent_string):
    '''Return browser name family and version.

    It will pre-populate the bug reporting form.
    '''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    ua = ua_dict.get('user_agent')
    name = ua.get('family')
    version = ua.get('major', u'Unknown')
    # Add on the minor and patch version numbers if they exist
    if version != u'Unknown' and ua.get('minor'):
        version = version + "." + ua.get('minor')
        if ua.get('patch'):
            version = version + "." + ua.get('patch')
    else:
        version = ''
    return '{0} {1}'.format(name, version)


def get_os(user_agent_string):
    '''Return operating system name.

    It pre-populates the bug reporting form.
    '''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    os = ua_dict.get('os')
    version = os.get('major', u'Unknown')
    if version != u'Unknown' and os.get('major'):
        version = version + "." + os.get('minor')
        if os.get('patch'):
            version = version + "." + os.get('patch')
    else:
        version = ''
    return '{0} {1}'.format(os.get('family'), version)


def get_headers(response):
    '''Return a dictionary of headers based on a passed in Response object.

    This allows us to proxy response headers from GitHub to our own responses.
    '''
    headers = {'etag': response.headers.get('etag'),
               'cache-control': response.headers.get('cache-control'),
               'content-type': JSON_MIME,
               'link': response.headers.get('link')}
    return headers


def get_referer(request):
    '''Return the Referer URI based on the passed in Request object.

    Also validate that it came from our own server. If it didn't, return None.
    '''
    host_whitelist = ('webcompat.com', 'staging.webcompat.com',
                      '127.0.0.1', 'localhost')
    if request.referrer:
        host = urlparse.urlparse(request.referrer).hostname
        if host in host_whitelist:
            return request.referrer
    else:
        return None
