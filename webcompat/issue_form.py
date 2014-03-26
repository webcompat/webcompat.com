# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from wtforms import Form, RadioField, StringField, TextAreaField
from wtforms.validators import Optional, Required


owner_choices = [('True', 'Yes'), ('False', 'No')]
problem_choices = [('browser_bug', 'Looks like the browser has a bug'),
                   ('site_bug', 'Looks like the website has a bug.'),
                   ('unknown_bug', 'I don\'t know but something\'s wrong.')]
url_message = 'A valid URL is required to report a bug!'
summary_message = 'Please give the bug report a summary.'


class IssueForm(Form):
    url = StringField('Site URL', [Required(message=url_message)])
    browser = StringField('Browser', [Optional()])
    version = StringField('Version', [Optional()])
    summary = StringField('Problem in 5 words',
                          [Required(message=summary_message)])
    description = TextAreaField('How can we replicate this?', [Optional()])
    site_owner = RadioField('Is this your website?', [Optional()],
                            choices=owner_choices)
    problem_category = RadioField('What seems to be the trouble?',
                                  [Optional()], choices=problem_choices)


def wrap_label(type, value):
    '''Helper method to wrap a label and its type in an HTML comment (which
    we use to hide from users in GitHub issues. We can parse these later and
    add labels programmatically (as you have to have push access to the report
    to add labels.'''
    return '<!-- @{0}: {1} -->'.format(type, value)


def get_problem(type):
    for choice in problem_choices:
        if choice[0] == type:
            return choice[1]
    # Something probably went wrong. Return something safe.
    return "Unknown"


def get_owner(bool):
    if bool == 'True':
        return 'Yes'
    elif bool == 'False':
        return 'No'
    else:
        return 'Unknown'


def get_labels(form_object):
    '''Create a list of labels, join on \n, return the result.'''
    # TODO: labels should be parsed from the Browser field, which we should
    # prepopulate with navigator.userAgent. We can use tobie's ua parser
    # to get mobile, tablet, desktop, browsername maybe?
    return ''


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
    body = '''{0}

**URL**: {1}
**Browser**: {2}
**Version**: {3}
**Problem type**: {4}
**Site owner**: {5}

**Steps to Reproduce**
{6}'''.format(get_labels(form_object),
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
