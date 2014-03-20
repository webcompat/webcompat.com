# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from flask import Flask, render_template
from flask.ext.github import GitHub
from sqlalchemy import create_engine
import os

app = Flask(__name__)
app.config.from_object('config')
engine = create_engine('sqlite:///' + os.path.join(app.config['BASE_DIR'],
                                                   'github-session.db'))
github = GitHub(app)

# import views after we initialize our github object
import webcompat.views
