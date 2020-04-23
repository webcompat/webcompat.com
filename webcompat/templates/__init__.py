#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Module where we register Jinja template filters."""

import hashlib
import os

from webcompat import app

STATIC_PATH = os.getcwd() + '/webcompat/static'

cache_dict = {}


@app.template_filter('bust_cache')
def bust_cache(file_path):
    """Jinja2 filter to add a cache busting param based on md5 checksum.

    Uses a simple cache_dict to we don't have to hash each file for every
    request. This is kept in-memory so it will be blown away when the app
    is restarted (which is when file changes would have been deployed).
    """
    def get_checksum(file_path):
        try:
            checksum = cache_dict[file_path]
        except KeyError:
            checksum = md5_checksum(file_path)
            cache_dict[file_path] = checksum
        return checksum

    return file_path + '?' + get_checksum(STATIC_PATH + file_path)


def md5_checksum(file_path):
    """Return the md5 checksum for a given file path."""
    with open(file_path, 'rb') as fh:
        m = hashlib.md5()
        while True:
            # only read in 8k of the file at a time
            data = fh.read(8192)
            if not data:
                break
            m.update(data)
        return m.hexdigest()


@app.template_filter('format_date')
def format_date(datestring):
    """For now, just chops off crap."""
    # 2014-05-01T02:26:28Z
    return datestring[0:10]
