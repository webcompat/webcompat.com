#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''This module powers the webcompat.com Flask application.'''

import os

from flask.ext.cache import Cache
from flask.ext.github import GitHub
from flask import Flask
from sqlalchemy import create_engine

app = Flask(__name__, static_url_path='')
app.config.from_object('config')
engine = create_engine('sqlite:///' + os.path.join(app.config['BASE_DIR'],
                                                   'session.db'))

github = GitHub(app)

cache = Cache(app)

# import views after we initialize our github object
import webcompat.views

# register API blueprint
from api.endpoints import api
app.register_blueprint(api)
