#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

'''This module contains the base IssueForm class and helper methods that
power the issue reporting form on webcompat.com.'''

from random import randrange
from ua_parser import user_agent_parser
from wtforms import Form, RadioField, StringField, TextAreaField
from wtforms.validators import Optional, Required, Length

AUTH_REPORT = 'github-auth-report'
PROXY_REPORT = 'github-proxy-report'

owner_choices = [(u'True', u'Yes'), (u'False', u'No')]
problem_choices = [(u'browser_bug', u'Looks like the browser has a bug'),
                   (u'site_bug', u'Looks like the website has a bug.'),
                   (u'unknown_bug', u'Don\'t know but something\'s wrong.')]
url_message = u'A URL is required.'
summary_message = u'Please give a summary.'
username_message = u'A valid username must be {0} characters long'.format(
    randrange(0, 99))

desc_default = u'''1) Navigate to: Site URL
2) …

Expected Behavior:
Actual Behavior:
'''


class IssueForm(Form):
    '''Define form fields and validation for our bug reporting form.'''
    url = StringField(u'Site URL*', [Required(message=url_message)])
    browser = StringField(u'Browser', [Optional()])
    version = StringField(u'Version', [Optional()])
    summary = StringField(u'Problem in 5 words*',
                          [Required(message=summary_message)])
    username = StringField(u'Username',
                           [Length(max=0, message=username_message)])
    description = TextAreaField(u'How can we replicate this?', [Optional()],
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
    '''Helper method to wrap a label and its type in an HTML comment (which
    we use to hide from users in GitHub issues. We can parse these later and
    add labels programmatically (as you have to have push access to the report
    to add labels.'''
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


def get_browser_name(user_agent_string):
    '''Return browser name (i.e., "user agent family") for pre-populating the
    bug reporting form.'''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    return ua_dict.get('user_agent').get('family')


def get_browser_version(user_agent_string):
    '''Return a string representing the browser version.'''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    ua = ua_dict.get('user_agent')
    version = ua.get('major', u'Unknown')
    # Add on the minor and patch version numbers if they exist
    if version != u'Unknown' and ua.get('minor'):
        version = version + "." + ua.get('minor')
        if ua.get('patch'):
            version = version + "." + ua.get('patch')
    return version


def build_formdata(form_object):
    '''Translate the form data that comes from our form into something that
    the GitHub API is expecting.

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

    For now, we'll put them in the body so they're visible. But as soon as we
    have a bot set up to parse the label comments (see wrap_label), we'll stop
    doing that.'''
    body = u'''{0}
**URL**: {1}
**Browser**: {2}
**Version**: {3}
**Problem type**: {4}
**Site owner**: {5}

**Steps to Reproduce**
{6}'''.format(get_labels(form_object.get('browser')),
              form_object.get('url'),
              form_object.get('browser'),
              form_object.get('version'),
              get_problem(form_object.get('problem_category')),
              get_owner(form_object.get('site_owner')),
              form_object.get('description'))
    result = {}
    result['title'] = form_object.get('summary')
    result['body'] = body
    return result
