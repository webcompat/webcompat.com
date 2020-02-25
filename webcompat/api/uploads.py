#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for file uploads.'''

import base64
import datetime
import io
import json
import os
import re
import uuid

from flask import abort
from flask import Blueprint
from flask import request
from PIL import Image
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import RequestEntityTooLarge

from webcompat import app
from webcompat.helpers import get_data_from_request

uploads_bp = Blueprint('uploads_bp', __name__, url_prefix='/upload',
                       template_folder='../templates')
JSON_MIME = 'application/json'


class BaseUpload(object):
    def __init__(self):
        today = datetime.date.today()
        self.year = str(today.year)
        self.month = str(today.month)
        self.file_id = str(uuid.uuid4())

    def get_file_path(self, year, month, file_id, ext):
        file_name = file_id + '.' + ext
        return os.path.join(year, month, file_name)


class ImageUpload(BaseUpload):

    '''Class that abstracts over saving image and screenshot uploads.

    It performs a simple extension-based validation before saving to the
    file system. If a file is not allowed, a TypeError exception
    is raised.
    '''
    ALLOWED_FORMATS = ('jpg', 'jpeg', 'jpe', 'png', 'gif', 'bmp')

    def __init__(self, imagedata):
        super().__init__()
        self.image_object = self.to_image_object(imagedata)
        self.file_ext = self.get_file_ext()
        self.image_path = self.get_file_path(self.year, self.month,
                                             self.file_id, self.file_ext)

    def to_image_object(self, imagedata):
        '''Method to return a Pillow Image object from the raw imagedata.'''
        try:
            # Is this a file upload (i.e., issue form upload)?
            if isinstance(imagedata, FileStorage):
                return Image.open(imagedata)
            # Is this a base64 encoded image (i.e., bug report screenshot)?
            if (isinstance(imagedata, str) and
                    imagedata.startswith('data:image/')):
                # Chop off 'data:image/.+;base64,' before decoding
                imagedata = re.sub('^data:image/.+;base64,', '', imagedata)
                # This will fix any incorrectly padded data.
                imagedata = imagedata + '==='
                return Image.open(io.BytesIO(base64.b64decode(imagedata)))
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

    def get_filename(self, image_path):
        '''Method to return the uploaded filename (with extension).'''
        return self.get_url(image_path).split('/')[-1]

    def get_url(self, image_path):
        '''Method to return a URL for the uploaded file.'''
        return app.config['UPLOADS_DEFAULT_URL'] + image_path

    def save(self):
        '''Check that the file is allowed, then save to filesystem.'''
        save_parameters = {}
        if self.file_ext not in self.ALLOWED_FORMATS:
            raise TypeError('Image file format not allowed')
        # Paths of the images
        file_dest = app.config['UPLOADS_DEFAULT_DEST'] + self.image_path
        dest_dir = os.path.dirname(file_dest)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        # Alpha channels are not supported in JPEG
        if (self.image_object.format == 'PNG'):
            self.image_object = self.image_object.convert('RGB')
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

    def get_file_info(self):
        return {
            'filename': self.get_filename(self.image_path),
            'url': self.get_url(self.image_path),
        }


class LogUpload(BaseUpload):
    def __init__(self, data):
        super().__init__()
        self.data = self.process_json(data)
        self.file_path = self.get_file_path(self.year, self.month,
                                            self.file_id, 'json')

    def process_json(self, data):
        try:
            return json.loads(data)
        except ValueError:
            abort(400)

    def get_url(self, file_path):
        return os.path.splitext(file_path)[0]

    def save(self):
        file_dest = app.config['UPLOADS_DEFAULT_DEST'] + self.file_path
        dest_dir = os.path.dirname(file_dest)

        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)

        with open(file_dest, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False)

    def get_file_info(self):
        return {
            'url': self.get_url(self.file_path)
        }


@uploads_bp.route('/', methods=['POST'])
def upload():
    '''Endpoint to upload an image or a json with console logs.

    If the file asset passes validation, it's saved as:
        UPLOADS_DEFAULT_DEST + /year/month/random-uuid.ext

    Returns a JSON string that contains the filename and url.
    '''
    file_type, data = get_data_from_request(request)
    if not data:
        # We don't know what you're trying to do, but it ain't gonna work.
        abort(501)

    try:
        if file_type is 'image':
            upload = ImageUpload(data)
        else:
            upload = LogUpload(data)

        upload.save()
        file_info = upload.get_file_info()
        return json.dumps(file_info), 201, {'content-type': JSON_MIME}
    except (TypeError, IOError):
        abort(415)
    except RequestEntityTooLarge:
        abort(413)
