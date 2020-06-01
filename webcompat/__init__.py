#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""This module powers the webcompat.com Flask application."""

import logging

from flask import Flask
from flask_firehose import Firehose
from flask_github import GitHub
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Define the application
app = Flask(__name__, static_url_path='')
Firehose(app)
# Adds the HTTP/2 Server Push functionality to app
# firehose = Firehose(connector=Custom_connector())
# firehose.init_app(app)

# Configurations
app.config.from_object('config')
# set limit of 5.5MB for file uploads
# in practice, this is ~4MB (5.5 / 1.37)
# after the data URI is saved to disk
app.config['MAX_CONTENT_LENGTH'] = 5.5 * 1024 * 1024

github = GitHub(app)
limiter = Limiter(app, key_func=get_remote_address)

# import views after we initialize our github object
import webcompat.templates  # noqa
import webcompat.views  # noqa
from webcompat import webhooks  # noqa

# register blueprints
from webcompat.api.endpoints import api_bp  # noqa
from webcompat.api.uploads import uploads_bp  # noqa
from webcompat.error_handlers import error_handlers_bp  # noqa

for blueprint in [api_bp, error_handlers_bp, uploads_bp]:
    app.register_blueprint(blueprint)


# Start Logging Handlers
# See config/__init__.py for parameters
file_handler = logging.FileHandler(app.config['LOG_FILE'])
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(logging.Formatter(app.config['LOG_FMT']))
app.logger.addHandler(file_handler)
