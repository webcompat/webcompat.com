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
from wtforms import RadioField
from wtforms import StringField
from wtforms import TextAreaField
from wtforms.validators import Length
from wtforms.validators import Optional
from wtforms.validators import Required

AUTH_REPORT = 'github-auth-report'
PROXY_REPORT = 'github-proxy-report'
SCHEMES = ('http://', 'https://')

owner_choices = [(u'True', u'Yes'), (u'False', u'No')]
problem_choices = [
    (u'detection_bug',   u'Desktop site instead of mobile site'),
    (u'mobile_site_bug', u'Mobile site is not usable'),
    (u'video_bug',       u'Video does\'nt play'),
    (u'layout_bug',      u'Layout is messed up'),
    (u'text_bug',        u'Text is not visible'),
    (u'unknown_bug',     u'Somethign else - I\'ll add details below')
]
url_message = u'A URL is required.'
summary_message = u'Please give a summary.'
username_message = u'A valid username must be {0} characters long'.format(
    random.randrange(0, 99))

desc_default = u'''1) Navigate to: Site URL
2) …

Expected Behavior:
Actual Behavior:
'''


class IssueForm(Form):
    '''Define form fields and validation for our bug reporting form.'''
    url = StringField(u'Site URL*', [Required(message=url_message)])
    browser = StringField(u'Browser / Version', [Optional()])
    os = StringField(u'Operating System', [Optional()])
    summary = StringField(u'Problem in 5 words*',
                          [Required(message=summary_message)])
    username = StringField(u'Username',
                           [Length(max=0, message=username_message)])
    description = TextAreaField(u'Give more details (optional)', [Optional()],
                                default=desc_default)
    site_owner = RadioField(u'Is this your website?', [Optional()],
                            choices=owner_choices)
    problem_category = RadioField(u'What seems to be the trouble?',
                                  [Optional()], choices=problem_choices)


def get_problem(category):
    '''Return human-readable label for problem choices form value.'''
    for choice in problem_choices:
        if choice[0] == category:
            return choice[1]
    # Something probably went wrong. Return something safe.
    return u'Unknown'


def get_owner(is_site_owner):
    '''Return human-readable language (Y/N) for site owner form value.'''
    if is_site_owner == 'True':
        return u'Yes'
    elif is_site_owner == 'False':
        return u'No'
    else:
        return u'Unknown'


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
    Category -> labels
    Owner -> labels

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
    # URL normalization
    url = form_object.get('url')
    normalized_url = normalize_url(url)
    # Domain extraction
    domain = domain_name(normalized_url)
    if domain:
        summary = '{0} - {1}'.format(domain, form_object.get('summary'))
    else:
        summary = '{0}'.format(form_object.get('summary'))
    # Preparing the body
    body = u'''{0}{1}
**URL**: {2}
**Browser / Version**: {3}
**Operating System**: {4}
**Problem type**: {5}
**Site owner**: {6}

**Steps to Reproduce**
{7}'''.format(get_labels(form_object.get('browser')),
              wrap_label(('ua_header', form_object.get('ua_header'))),
              form_object.get('url'),
              form_object.get('browser'),
              form_object.get('os'),
              get_problem(form_object.get('problem_category')),
              get_owner(form_object.get('site_owner')),
              form_object.get('description'))
    result = {}
    result['title'] = summary
    result['body'] = body
    return result
