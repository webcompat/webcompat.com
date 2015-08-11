#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''This module contains the base IssueForm class and helper methods that
power the issue reporting form on webcompat.com.'''

import random
import urlparse

from wtforms import Form
from wtforms import FileField
from wtforms import RadioField
from wtforms import StringField
from wtforms import TextAreaField
from wtforms.validators import InputRequired
from wtforms.validators import Length
from wtforms.validators import Optional

AUTH_REPORT = 'github-auth-report'
PROXY_REPORT = 'github-proxy-report'
SCHEMES = ('http://', 'https://')

problem_choices = [
    (u'detection_bug',   u'Desktop site instead of mobile site'),
    (u'mobile_site_bug', u'Mobile site is not usable'),
    (u'video_bug',       u'Video doesn\'t play'),
    (u'layout_bug',      u'Layout is messed up'),
    (u'text_bug',        u'Text is not visible'),
    (u'unknown_bug',     u'Something else - I\'ll add details below')
]

url_message = u'A URL is required.'
radio_message = u'Problem type required.'
username_message = u'A valid username must be {0} characters long'.format(
    random.randrange(0, 99))

problem_label = (u'What seems to be the trouble?',
                 '<span class="wc-Form-required">*</span>')
url_label = u'Site URL <span class="wc-Form-required">*</span>'

desc_default = u'''1) Navigate to: Site URL
2) …

Expected Behavior:

Actual Behavior:
'''


class IssueForm(Form):
    '''Define form fields and validation for our bug reporting form.'''
    url = StringField(url_label,
                      [InputRequired(message=url_message)])
    browser = StringField(u'Browser / Version', [Optional()])
    os = StringField(u'Operating System', [Optional()])
    username = StringField(u'Username',
                           [Length(max=0, message=username_message)])
    description = TextAreaField(u'Give more details', [Optional()],
                                default=desc_default)
    problem_category = RadioField(problem_label,
                                  [InputRequired(message=radio_message)],
                                  choices=problem_choices)
    # TODO: image (filename?) validation here.
    image = FileField(u'Attach a screenshot')


def get_problem(category):
    '''Return human-readable label for problem choices form value.'''
    for choice in problem_choices:
        if choice[0] == category:
            return choice[1]
    # Something probably went wrong. Return something safe.
    return u'Unknown'


def get_problem_summary(category):
    '''Allows us to special case the "Other" radio choice summary.'''
    if category == 'unknown_bug':
        return u'see bug description'
    else:
        return get_problem(category).lower()


def wrap_label(label):
    '''Helper method to wrap a label and its type in an HTML comment.

    We use it to hide from users in GitHub issues.
    We can parse these later and add labels programmatically (as you
    have to have push access to the report to add labels.
    '''
    return u'<!-- @{0}: {1} -->\n'.format(*label)


def get_labels(browser_name):
    '''Return all labels as a single string.'''
    labels = []
    result = ''
    # Only the name for now.
    labels.append(('browser', browser_name))
    # Now, "wrap the labels" and return them all as a single string
    for label in labels:
        result += wrap_label(label)
    return result


def normalize_url(url):
    '''normalize URL for consistency.'''
    url = url.strip()
    if not url.startswith(SCHEMES):
        # We assume that http is missing not https
        url = 'http://%s' % (url)
    return url


def domain_name(url):
    '''Extract the domain name of a sanitized version of the submitted URL.'''
    # Removing leading spaces
    url = url.lstrip()
    # testing if it's an http URL
    if url.startswith(SCHEMES):
        domain = urlparse.urlparse(url).netloc
    else:
        domain = None
    return domain


def build_formdata(form_object):
    '''Convert HTML form data to GitHub API data.

    Summary -> title
    Browser -> part of body, labels
    Version -> part of body
    URL -> part of body
    Description -> part of body
    Image Upload -> part of body
    Category -> labels

    We'll try to parse the Browser and come up with a browser label, as well
    as labels like mobile, desktop, tablet.

    Here's a description of what the Issues API expects to create an issue
    (as of March 25, 2014):

    -------------------------------------------------------------------
    | title | string             | The title of the issue. Required.    |
    | body  | string             | The contents of the issue.           |
    | labels| array of strings   | Labels to associate with this issue. |
    -------------------------------------------------------------------

    NOTE: Only users with push access can set labels for new issues.
    Labels are silently dropped otherwise.
    NOTE: intentionally leaving out `milestone` and `assignee`.
    '''
    # Do domain extraction for adding to the summary/title
    url = form_object.get('url')
    normalized_url = normalize_url(url)
    domain = domain_name(normalized_url)
    problem_summary = get_problem_summary(form_object.get('problem_category'))

    if domain:
        summary = '{0} - {1}'.format(domain, problem_summary)
    else:
        summary = '{0} - {1}'.format(normalized_url, problem_summary)

    formdata = {
        'browser_label': get_labels(form_object.get('browser')),
        'ua_label': wrap_label(('ua_header', form_object.get('ua_header'))),
        'url': form_object.get('url'),
        'browser': form_object.get('browser'),
        'os': form_object.get('os'),
        'problem_type': get_problem(form_object.get('problem_category')),
        'description': form_object.get('description'),
        'image_name': form_object.get('image_upload')[0],
        'image_url': form_object.get('image_upload')[1]
    }

    # Preparing the body
    body = u'''{browser_label}{ua_label}
**URL**: {url}
**Browser / Version**: {browser}
**Operating System**: {os}
**Problem type**: {problem_type}

**Steps to Reproduce**
{description}

![{image_name}]({image_url})
'''.format(**formdata)
    # Add the image, if there was one.
    if form_object.get('image_upload') is not None:
        body += '\n\n![{image_name}]({image_url})'.format(
            image_name=form_object.get('image_upload').get('filename'),
            image_url=form_object.get('image_upload').get('url'))
    result = {}
    result['title'] = summary
    result['body'] = body
    return result
