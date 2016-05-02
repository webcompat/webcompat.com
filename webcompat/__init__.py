#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''This module powers the webcompat.com Flask application.'''

import logging
import os

from flask.ext.github import GitHub
from flask.ext.limiter import Limiter
from flask import Flask

app = Flask(__name__, static_url_path='')
app.config.from_object('config')

# set limit of 4MB for file uploads
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024

github = GitHub(app)
limiter = Limiter(app)

# import views after we initialize our github object
import webcompat.views

# register blueprints
from api.endpoints import api
from api.uploads import uploads
from error_handlers import error_handlers
from webhooks import webhooks

for blueprint in [api, error_handlers, uploads, webhooks]:
    app.register_blueprint(blueprint)


# Start Logging Handlers
# See config/__init__.py for parameters
file_handler = logging.FileHandler(app.config['LOG_FILE'])
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(app.config['LOG_FMT']))
app.logger.addHandler(file_handler)
