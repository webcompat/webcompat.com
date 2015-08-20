#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for image uploads.'''

import json

from flask import abort
from flask import Blueprint
from flask import request
from flaskext.uploads import configure_uploads
from flaskext.uploads import IMAGES
from flaskext.uploads import patch_request_class
from flaskext.uploads import UploadSet
from flaskext.uploads import UploadNotAllowed
from werkzeug import secure_filename
from uuid import uuid4

from webcompat import app

uploads = Blueprint('uploads', __name__, url_prefix='/upload',
                    template_folder='../templates')
JSON_MIME = 'application/json'
images = UploadSet('uploads', IMAGES)
configure_uploads(app, images)

# limit image uploads to 4MB
patch_request_class(app, 4 * 1024 * 1024)

#TODO dated namespace

@uploads.route('/', methods=['POST'])
def upload():
    '''Endpoint to upload an image.

    Returns a JSON string that contains the filename and url.
    '''
    if request.method == 'POST' and 'image' in request.files:
        try:
            file = request.files['image']
            file_ext = file.filename.split('.')[-1]
            filename = str(uuid4()) + '.' + file_ext
            images.save(file, name=filename)
            data = {
                'filename': filename,
                'url': images.url(filename)
            }
            return (json.dumps(data), 201, {'content-type': JSON_MIME})
        except UploadNotAllowed:
            abort(415)
    else:
        abort(501)
