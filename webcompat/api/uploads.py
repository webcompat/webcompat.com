#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for image uploads.'''

import base64
import json
import os
import re

from datetime import date
from flask import abort
from flask import Blueprint
from flask import request
from io import BytesIO
from PIL import Image
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import RequestEntityTooLarge
from uuid import uuid4

from webcompat import app

uploads = Blueprint('uploads', __name__, url_prefix='/upload',
                    template_folder='../templates')
JSON_MIME = 'application/json'


class Upload(object):

    '''Class that abstracts over saving image and screenshot uploads.

    It performs a simple extension-based validation before saving to the
    file system. If a file is not allowed, a TypeError exception
    is raised.
    '''
    ALLOWED_FORMATS = ('jpg', 'jpeg', 'jpe', 'png', 'gif', 'bmp')

    def __init__(self, imagedata):
        self.image_object = self.to_image_object(imagedata)
        self.file_ext = self.get_file_ext()

    def to_image_object(self, imagedata):
        '''Method to return a Pillow Image object from the raw imagedata.'''
        try:
            # Is this a file upload (i.e., issue form upload)?
            if isinstance(imagedata, FileStorage):
                return Image.open(imagedata)
            # Is this a base64 encoded image (i.e., bug report screenshot)?
            if (isinstance(imagedata, unicode) and
                    imagedata.startswith('data:image/')):
                # Chop off 'data:image/.+;base64,' before decoding
                imagedata = re.sub('^data:image/.+;base64,', '', imagedata)
                return Image.open(BytesIO(base64.b64decode(imagedata)))
            raise TypeError('TypeError: Not a valid image format')
        except TypeError:
            # Not a valid format
            abort(415)

    def get_file_ext(self):
        '''Method to return the file extension, as determined by Pillow.

        (But, we return jpg for png images, since we convert them always.)
        '''
        if self.image_object.format.lower() == 'png':
            return 'jpg'
        return self.image_object.format.lower()

    def get_filename(self):
        '''Method to return the uploaded filename (with extension).'''
        return self.get_url().split('/')[-1]

    def get_url(self):
        '''Method to return a URL for the uploaded file.'''
        return app.config['UPLOADS_DEFAULT_URL'] + self.file_path

    def save(self):
        '''Check that the file is allowed, then save to filesystem.'''
        save_parameters = {}
        if self.file_ext not in self.ALLOWED_FORMATS:
            raise TypeError('Image file format not allowed')

        today = date.today()
        self.file_path = os.path.join(str(today.year), str(today.month),
                                      str(uuid4()) + '.' + self.file_ext)
        file_dest = app.config['UPLOADS_DEFAULT_DEST'] + self.file_path
        dest_dir = os.path.dirname(file_dest)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        # Optimize further the image compression for these formats
        if self.image_object.format in ['JPEG', 'JPG', 'JPE', 'PNG']:
            save_parameters['optimize'] = True
            # Convert PNG to JPEG. See issue #1051
            file_dest = 'jpg'.join(file_dest.rsplit('png', 1))
        # If animated GIF, aka duration > 0, add save_all parameter
        if (self.image_object.format == 'GIF' and
                self.image_object.info['duration'] > 0):
            save_parameters['save_all'] = True
        # unpacking save_parameters
        self.image_object.save(file_dest, **save_parameters)


@uploads.route('/', methods=['POST'])
def upload():
    '''Endpoint to upload an image.

    If the image asset passes validation, it's saved as:
        UPLOADS_DEFAULT_DEST + /year/month/random-uuid.ext

    Returns a JSON string that contains the filename and url.
    '''
    if 'image' in request.files and request.files['image'].filename:
        imagedata = request.files['image']
    elif 'image' in request.form:
        imagedata = request.form['image']
    else:
        # We don't know what you're trying to do, but it ain't gonna work.
        abort(501)

    try:
        upload = Upload(imagedata)
        upload.save()
        data = {
            'filename': upload.get_filename(),
            'url': upload.get_url()
        }
        return (json.dumps(data), 201, {'content-type': JSON_MIME})
    except (TypeError, IOError):
        abort(415)
    except RequestEntityTooLarge:
        abort(413)
