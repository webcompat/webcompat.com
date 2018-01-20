#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Flask Blueprint for HTTP error handling.'''

from flask import Blueprint
from flask import jsonify
from flask import render_template
from flask import request

from webcompat import app

error_handlers = Blueprint('error', __name__, url_prefix='/error')

ERROR_DICT = {
    400: 'Bad Request.',
    401: 'Unauthorized. Please log in.',
    403: 'Forbidden. Tsk tsk.',
    404: 'Not Found. Lost in Punk Cat Space',
    429: 'Cool your jets! Please wait {0} seconds before making '
         'another search.',
    500: 'Internal Server Error'
}


@error_handlers.route('/<int:code>')
def error_response(code, req=request):
    """Helper method to prepare the error response.

    Unknown codes will be treated as 500.
    """
    if code not in ERROR_DICT:
        return error_response(500, req)
    if api_call(req):
        resp = jsonify({'status': code, 'message': ERROR_DICT[code]})
        resp.status_code = code
        return resp
    return render_template('error.html', error_code=code,
                           error_message=ERROR_DICT[code]), code


def api_call(req):
    '''Helper method to check if the request originates from an API call'''
    return bool(req.path.startswith('/api/') and
                req.accept_mimetypes.accept_json and
                not req.accept_mimetypes.accept_html)


@error_handlers.app_errorhandler(400)
@error_handlers.app_errorhandler(401)
@error_handlers.app_errorhandler(403)
@error_handlers.app_errorhandler(404)
@error_handlers.app_errorhandler(500)
def custom_error_handler(err):
    """Log the exception stack trace (but don't bother for localhost because
    the Flask debugger is already enabled)"""
    if not app.config['LOCALHOST']:
        app.logger.exception('Exception thrown:')
    try:
        return error_response(err.code, request)
    except AttributeError:
        # Somethign bad happened, we're not dealing with an HTTPError
        return error_response(500, request)


@error_handlers.app_errorhandler(429)
def too_many_requests_status(err):
    '''Error handler that comes from hitting our API rate limits.

    Sent by Flask Limiter.

    error_data.message is displayed in the flash message
    error_data.timeout determines how long until flash message disappears
    '''
    # TODO: determine actual time left.
    # TODO: send message with login link.
    time_left = 60
    resp = jsonify(
        {'message': (ERROR_DICT[err.code]).format(time_left), 'timeout': 5}
    )
    resp.status_code = err.code
    return resp
