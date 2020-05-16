#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Helpers specific to the API Blueprint module."""

import json

from flask import make_response
from flask import render_template

from webcompat.helpers import get_response_headers

HTML_MIME = 'text/html'


def get_html_comments(response):
    """Helper method to create a response from our comment template.

    The template expects a list of dict objects, so create a list
    in the instance where we have a single object.
    """
    comment_json, comment_status = response[:2]
    # In the case of a 304, GitHub won't send us back a body, but
    # the browser cache will correctly load the data.
    try:
        comment_json = json.loads(comment_json)
    except ValueError:
        pass
    if isinstance(comment_json, dict):
        comment_json = [comment_json]
    comment_html = render_template('issue/issue-comment-list.html',
                                   comments=comment_json)
    return make_response(comment_html, comment_status,
                         get_response_headers(response, HTML_MIME))
