#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from ua_parser import user_agent_parser
from wtforms import Form, RadioField, StringField, TextAreaField
from wtforms.validators import Optional, Required


owner_choices = [(u'True', u'Yes'), (u'False', u'No')]
problem_choices = [(u'browser_bug', u'Looks like the browser has a bug'),
                   (u'site_bug', u'Looks like the website has a bug.'),
                   (u'unknown_bug', u'I don\'t know but something\'s wrong.')]
url_message = u'A valid URL is required to report a bug!'
summary_message = u'Please give the bug report a summary.'


class IssueForm(Form):
    url = StringField(u'Site URL*', [Required(message=url_message)])
    browser = StringField(u'Browser', [Optional()])
    version = StringField(u'Version', [Optional()])
    summary = StringField(u'Problem in 5 words*',
                          [Required(message=summary_message)])
    description = TextAreaField(u'How can we replicate this?', [Optional()])
    site_owner = RadioField(u'Is this your website?', [Optional()],
                            choices=owner_choices)
    problem_category = RadioField(u'What seems to be the trouble?',
                                  [Optional()], choices=problem_choices)


def get_problem(type):
    for choice in problem_choices:
        if choice[0] == type:
            return choice[1]
    # Something probably went wrong. Return something safe.
    return u'Unknown'


def get_owner(bool):
    if bool == 'True':
        return u'Yes'
    elif bool == 'False':
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
    labels = []
    result = ''
    # Only the name for now.
    labels.append(('browser', browser_name))
    # Now, "wrap the labels" and return them all as a single string
    for label in labels:
        result += wrap_label(label)
    return result


def get_browser_name(user_agent_string):
    ua_dict = user_agent_parser.Parse(user_agent_string)
    return ua_dict.get('user_agent').get('family')


def get_browser_version(user_agent_string):
    '''Returns a string representing the browser version.'''
    ua_dict = user_agent_parser.Parse(user_agent_string)
    ua = ua_dict.get('user_agent')
    version = ua.get('major', u'Unknown')
    # Add on the minor and patch version numbers if they exist
    if version != u'Unknown' and ua.get('minor'):
        version = version + "." + ua.get('minor')
        if ua.get('patch'):
            version = version + "." + ua.get('patch')
    return version


def build_formdata(request):
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
    form_object = request.form
    user_agent_header = request.headers.get('User-Agent')
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
