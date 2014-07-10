#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from flask import session
from models import db_session, User
from webcompat import github


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