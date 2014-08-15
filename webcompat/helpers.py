#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from flask import session
from webcompat import github
from ua_parser import user_agent_parser


def get_user_info():
    '''Grab the username and avatar URL from GitHub and stash it
    in the session.'''
    if session.get('username') and session.get('avatar_url'):
        return
    else:
        gh_user = github.get('user')
        session['username'] = gh_user.get('login')
        session['avatar_url'] = gh_user.get('avatar_url')


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
