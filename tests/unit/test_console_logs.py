#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''Tests for console logs upload.'''

import json
from pathlib import Path
import pytest
from werkzeug.datastructures import MultiDict

import webcompat


LOG = [
    {
        'level': 'log',
        'log': [
            'test log'
        ],
        'uri': 'http://example.com/vendor.js',
        'pos': '95:13'
    },
    {
        'level': 'warn',
        'log': [
            'test warn'
        ],
        'uri': 'http://example.com/test.js',
        'pos': '1:28535'
    }
]


@pytest.fixture
def client(tmp_path):
    '''Setup environment for the tests.

    Using tmpdir that will create
    1. a tmp directory in your source code
    2. auto-cleanup without having to remove the files.
    '''
    webcompat.app.config['TESTING'] = True
    # Our configuration code is expecting a slash at the end.
    webcompat.app.config['UPLOADS_DEFAULT_DEST'] = str(tmp_path) + '/'
    with webcompat.app.test_client() as client:
        yield client


def get_json_contents(filepath):
    with open(filepath, 'r') as f:
        json_contents = json.load(f)
    return json_contents


def get_path(url):
    '''Build the full absolute path to the json log.'''
    url = url + '.json'
    return Path(webcompat.app.config['UPLOADS_DEFAULT_DEST']) / Path(url)


def form_request(data):
    '''Create a dictionary for console logs.'''
    d = MultiDict()
    d['console_logs'] = data
    return d


def test_get(client):
    '''Test that /upload/ doesn't let you GET.'''
    rv = client.get('/upload/')
    assert rv.status_code == 404


def test_console_log_upload(client):
    '''Test the upload of console.log to the server.'''
    rv = client.post('/upload/', data=form_request(json.dumps(LOG)))
    # file is created
    assert rv.status_code == 201
    # url is given in the response
    response = json.loads(rv.data)
    assert 'url' in response


def test_console_log_bad_format(client):
    '''Test to identify failures mode on file format.'''
    # invalid content type
    rv = client.post('/upload/', data=form_request('{test}'))
    assert rv.status_code == 400
    # empty content
    rv = client.post(
        '/upload/', data=form_request(''))
    assert rv.status_code == 501
    # wrong data structure
    rv = client.post(
        '/upload/', data=json.dumps(LOG))
    assert rv.status_code == 501


def test_console_log_file_contents(client):
    '''Test that we don't modify the data in a round trip.'''
    rv = client.post('/upload/', data=form_request(json.dumps(LOG)))
    response = json.loads(rv.data)
    filepath = get_path(response.get('url'))
    actual = get_json_contents(filepath)
    assert actual == LOG


def test_console_log_render(client):
    '''Test the rendered markup for console logs.'''
    test = [
        {
            'level': 'log',
            'log': [
                'test log'
            ],
            'uri': 'http://example.com/vendor.js',
            'pos': '95:13'
        },
        {
            'level': 'warn',
            'log': [
                '<script> alert("hi")</script>',
                'something else..'
            ],
            'uri': 'http://example.com/test.js',
            'pos': '1:28535'
        },
        {
            'level': 'error',
            'log': [
                '<div style="background-image: url(javascript:alert(\'XSS\'))">',  # noqa
            ],
            'uri': 'http://example.com/test.js',
            'pos': '1:28535'
        }
    ]

    rv = client.post(
        '/upload/', data=form_request(json.dumps(test)))
    response = json.loads(rv.data)
    console_logs_url = '/console_logs/' + response.get('url')
    print(console_logs_url)
    rv = client.get(console_logs_url)
    for expected in [
        b'<div class="log level-log">',
        b'<div class="log level-warn">',
        b'<div class="log level-error">',
        b'<a href="http://example.com/vendor.js">vendor.js:95:13</a>',
        b'test log',
        b'&lt;script&gt; alert(&#34;hi&#34;)&lt;/script&gt;',
        b'&lt;div style=&#34;background-image: url(javascript:alert(&#39;XSS&#39;))&#34;&gt;'  # noqa
    ]:
        assert expected in rv.data

    assert rv.status_code == 200
