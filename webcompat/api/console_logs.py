#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for image uploads.'''

import datetime
import json
import os
import uuid

from flask import abort
from flask import Blueprint
from flask import request

from webcompat import app

console_logs = Blueprint('console_logs', __name__, url_prefix='/console_logs')
JSON_MIME = 'application/json'


class UploadLog(object):
    def __init__(self, data):
        today = datetime.date.today()
        self.data = data
        self.year = str(today.year)
        self.month = str(today.month)
        self.file_id = str(uuid.uuid4())
        self.file_path = self.get_path(self.month, self.year, self.file_id)

    def get_path(self, month, year, file_id):
        return os.path.join(year, month, file_id + '.json')

    def get_url(self, file_path):
        return os.path.dirname(file_path)\
            + '/' + os.path.splitext(os.path.basename(file_path))[0]

    def save(self):
        file_dest = app.config['UPLOADS_DEFAULT_DEST'] + self.file_path
        dest_dir = os.path.dirname(file_dest)

        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)

        with open(file_dest, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False)


@console_logs.route('/', methods=['POST'])
def logs():
    try:
        content = json.loads(request.data)
        log = UploadLog(content)
        log.save()

        data = {
            'url': log.get_url(log.file_path)
        }

        return json.dumps(data), 201, {'content-type': JSON_MIME}
    except ValueError:
        abort(400)
