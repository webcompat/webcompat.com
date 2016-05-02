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

error_handlers = Blueprint('error_handlers', __name__)

ERROR_DICT = {
    400: 'Bad Request.',
    401: 'Unauthorized. Please log in.',
    403: 'Forbidden. Maybe that looking at private stuff?',
    404: 'Not Found. Lost in Punk Cat Space',
    429: 'Cool your jets! Please wait {0} seconds before making '
         'another search.',
    500: 'Internal Server Error'
}


def error_response(request, code):
    '''Helper method to prepare the error response.'''
    if api_call(request):
        resp = jsonify({'status': code, 'message': ERROR_DICT[code]})
        resp.status_code = code
        return resp
    return render_template('error.html', error_code=code,
                           error_message=ERROR_DICT[code]), code


def api_call(request):
    '''Helper method to check if the request originates from an API call'''
    if (request.path.startswith('/api/') and
       request.accept_mimetypes.accept_json and
       not request.accept_mimetypes.accept_html):
        return True
    else:
        return False


@error_handlers.app_errorhandler(400)
@error_handlers.app_errorhandler(401)
@error_handlers.app_errorhandler(403)
@error_handlers.app_errorhandler(404)
@error_handlers.app_errorhandler(500)
def custom_error_handler(err):
    # log the exception stack trace
    # (but don't bother for localhost because the
    # Flask debugger is already enabled)
    if not app.config['LOCALHOST']:
        app.logger.exception('Exception thrown:')
    try:
        return error_response(request, err.code)
    except AttributeError:
        # Somethign bad happened, we're not dealing with an HTTPError
        return error_response(request, 500)


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
