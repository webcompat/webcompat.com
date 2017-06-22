#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""This module contains the base IssueForm class and helper methods that
power the issue reporting form on webcompat.com."""

import random
import urlparse

from helpers import get_browser
from helpers import get_os

from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed
from flask_wtf.file import FileField
from wtforms import RadioField
from wtforms import StringField
from wtforms import TextAreaField
from wtforms.validators import InputRequired
from wtforms.validators import Length
from wtforms.validators import Optional

from webcompat import app
from webcompat.api.uploads import Upload

AUTH_REPORT = 'github-auth-report'
PROXY_REPORT = 'github-proxy-report'
SCHEMES = ('http://', 'https://')
BAD_SCHEMES = ('http:/', 'https:/', 'http:', 'https:')
GITHUB_HELP = u'_From [webcompat.com](https://webcompat.com/) with ❤️_'

problem_choices = [
    (u'detection_bug', u'Desktop site instead of mobile site'),
    (u'mobile_site_bug', u'Mobile site is not usable'),
    (u'video_bug', u'Video doesn\'t play'),
    (u'layout_bug', u'Layout is messed up'),
    (u'text_bug', u'Text is not visible'),
    (u'unknown_bug', u'Something else - I\'ll add details below')
]

url_message = u'A valid URL is required.'
image_message = (u'Please select an image of the following type:'
                 ' jpg, png, gif, or bmp.')
radio_message = u'Problem type required.'
username_message = u'A valid username must be {0} characters long'.format(
    random.randrange(0, 99))

problem_label = (u'What seems to be the trouble?',
                 '<span class="wc-Form-required">*</span>')
url_label = u'Site URL <span class="wc-Form-required">*</span>'

desc_default = u"""1. Navigate to: Site URL
2. …

Expected Behavior:

Actual Behavior:
"""


class IssueForm(FlaskForm):
    """Define form fields and validation for our bug reporting form."""
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
    # we filter allowed type in uploads.py
    # Note, we don't use the label programtically for this input[type=file],
    # any changes here need to be updated in form.html.
    image = FileField(u'Attach a screenshot image',
                      [Optional(),
                       FileAllowed(Upload.ALLOWED_FORMATS, image_message)])


def get_form(ua_header):
    """Return an instance of flask_wtf.FlaskForm with browser and os info."""
    bug_form = IssueForm()
    # add browser and version to bug_form object data
    bug_form.browser.data = get_browser(ua_header)
    bug_form.os.data = get_os(ua_header)
    return bug_form


def get_problem(category):
    """Return human-readable label for problem choices form value."""
    for choice in problem_choices:
        if choice[0] == category:
            return choice[1]
    # Something probably went wrong. Return something safe.
    return u'Unknown'


def get_problem_summary(category):
    """Creates the summary for the issue title."""
    if category == 'unknown_bug':
        # In this case, we need a special message
        return u'see bug description'
    else:
        # Return the usual message in lowercase
        # because it is not at the start of the summary.
        return get_problem(category).lower()


def wrap_metadata(metadata):
    """Helper method to wrap metadata and its type in an HTML comment.

    We use it to hide potentially (un)interesting metadata from the UI.
    """
    return u'<!-- @{0}: {1} -->\n'.format(*metadata)


def get_metadata(metadata_keys, form_object):
    """Return relevant metadata hanging off the form as a single string."""
    metadata = [(key, form_object.get(key)) for key in metadata_keys]
    # Now, "wrap the metadata" and return them all as a single string
    return ''.join([wrap_metadata(md) for md in metadata])


def normalize_url(url):
    """normalize URL for consistency."""
    url = url.strip()
    parsed = urlparse.urlparse(url)

    if url.startswith(BAD_SCHEMES) and not url.startswith(SCHEMES):
        # if url starts with a bad scheme, parsed.netloc will be empty,
        # so we use parsed.path instead
        path = parsed.path.lstrip('/')
        url = '{}://{}'.format(parsed.scheme, path)
        if parsed.query:
            url += '?' + parsed.query
        if parsed.fragment:
            url += '#' + parsed.fragment
    elif not parsed.scheme:
        # We assume that http is missing not https
        if url.startswith("//"):
            url = "http://{}".format(url[2:])
        else:
            url = 'http://{}'.format(url)
    return url


def domain_name(url):
    """Extract the domain name of a sanitized version of the submitted URL."""
    # Removing leading spaces
    url = url.lstrip()
    # testing if it's an http URL
    if url.startswith(SCHEMES):
        domain = urlparse.urlparse(url).netloc
    else:
        domain = None
    return domain


def build_formdata(form_object):
    """Convert HTML form data to GitHub API data.

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
    """
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
        'metadata': get_metadata(('browser', 'ua_header', 'reported_with'),
                                 form_object),
        'url': form_object.get('url'),
        'browser': form_object.get('browser'),
        'os': form_object.get('os'),
        'problem_type': get_problem(form_object.get('problem_category')),
        'description': form_object.get('description')
    }

    # Preparing the body
    body = u"""{metadata}
**URL**: {url}
**Browser / Version**: {browser}
**Operating System**: {os}
**Problem type**: {problem_type}

**Steps to Reproduce**
{description}

""".format(**formdata)
    # Add the image, if there was one.
    if form_object.get('image_upload') is not None:
        body += '\n\n![Screenshot of the site issue]({image_url})'.format(
            image_url=form_object.get('image_upload').get('url'))
    # Append "from webcompat.com" message to bottom (for GitHub issue viewers)
    body += u'\n\n{0}'.format(GITHUB_HELP)
    rv = {'title': summary, 'body': body}
    extra_label = form_object.get('label', None)
    if extra_label and extra_label in app.config['EXTRA_LABELS']:
        rv.update({'labels': [extra_label]})
    return rv
