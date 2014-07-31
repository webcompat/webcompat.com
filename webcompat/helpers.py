#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from flask import session
from models import db_session, User
from webcompat import github
from ua_parser import user_agent_parser


def get_user_info():
    user = User.query.get(session['user_id'])
    if user.avatar_url and user.username:
        session['username'] = user.username
        session['avatar_url'] = user.avatar_url
    else:
        gh_user = github.get('user')
        user.username = gh_user.get('login')
        user.avatar_url = gh_user.get('avatar_url')
        db_session.commit()
        session['username'] = user.username
        session['avatar_url'] = user.avatar_url


def get_browser_name(user_agent_string):
    '''Return just the browser name, unknown user agents will be reported as
    "other".'''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    name = ua_dict.get('user_agent').get('family').lower()
    if (name == 'firefox mobile' and
            ua_dict.get('os').get('family') == 'Firefox OS'):
        name = 'other'
    return name


def get_browser(user_agent_string):
    '''Return browser name (i.e., "user agent family") and version for
    pre-populating the bug reporting form.'''
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
    '''Return operating system name for pre-populating the bug reporting
    form.'''
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
