#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""IssueForm class module.

The module powers the issue reporting form on webcompat.com.
It includes helper methods.
"""

import json
import random
import re
import urllib.parse

from flask import g
from flask import url_for
from flask_wtf import FlaskForm
from flask_wtf.file import FileAllowed
from flask_wtf.file import FileField
from markupsafe import Markup
from wtforms import HiddenField
from wtforms import Label
from wtforms import RadioField
from wtforms import StringField
from wtforms import TextAreaField
from wtforms.validators import InputRequired
from wtforms.validators import Length
from wtforms.validators import Optional
from wtforms.validators import Regexp

from webcompat import app
from webcompat.api.uploads import ImageUpload
from webcompat.helpers import get_browser
from webcompat.helpers import get_os
from webcompat.helpers import get_details_list
from webcompat.helpers import is_json_object

AUTH_REPORT = 'github-auth-report'
PROXY_REPORT = 'github-proxy-report'
SCHEMES = ('http://', 'https://')
BAD_SCHEMES = ('http:/', 'https:/', 'http:', 'https:')
GITHUB_HELP = '_From [webcompat.com](https://webcompat.com/) with ❤️_'
NEW_ISSUE_STEPS = [
    {
        'number': 1,
        'id': 'address',
        'className': 'active',
        'label': 'Web address'
    },
    {
        'number': 2,
        'id': 'issue',
        'className': '',
        'label': 'Issue'
    },
    {
        'number': 3,
        'id': 'details',
        'className': '',
        'label': 'Details'
    },
    {
        'number': 4,
        'id': 'testing',
        'className': '',
        'label': 'Testing'
    },
    {
        'number': 5,
        'id': 'description',
        'className': '',
        'label': 'Description'
    },
    {
        'number': 6,
        'id': 'screenshot',
        'className': '',
        'label': 'Screenshot'
    },
    {
        'number': 7,
        'id': 'send',
        'className': 'last',
        'label': 'Send report'
    }
]

problem_choices = [
    ('detection_bug', 'Desktop site instead of mobile site'),
    ('site_bug', 'Site is not usable'),
    ('layout_bug', 'Design is broken'),
    ('video_bug', 'Video or audio doesn\'t play'),
    ('unknown_bug', 'Something else')
]

problem_choices_wizard = [
    ('detection_bug', 'svg-problem-mobile-vs-desktop.svg',
     'Desktop site instead of mobile site'),
    ('site_bug', 'svg-problem-no-use.svg', 'Site is not usable'),
    ('layout_bug', 'svg-problem-broken-design.svg', 'Design is broken'),
    ('video_bug', 'svg-problem-no-video.svg', 'Video or audio doesn\'t play'),
    ('unknown_bug', 'svg-problem-question.svg', 'Something else')
]

site_bug_choices = [
    ('browser_unsupported', 'svg-subproblem-unsupported.svg',
     'Browser unsupported'),
    ('page_not_loading', 'svg-subproblem-empty-page.svg',
     'Page not loading correctly'),
    ('missing_items', 'svg-subproblem-items-missing.svg', 'Missing items'),
    ('buttons_not_working', 'svg-subproblem-cant-click.svg',
     'Buttons or links not working'),
    ('unable_to_type', 'svg-subproblem-cant-type.svg', 'Unable to type'),
    ('unable_to_login', 'svg-subproblem-cant-login.svg', 'Unable to login'),
    ('captcha_problems', 'svg-subproblem-captcha.svg', 'Problems with Captcha')
]

layout_bug_choices = [
    ('images_not_loaded', 'svg-subproblem-no-images.svg', 'Images not loaded'),
    ('overlapped_items', 'svg-subproblem-overlapping.svg',
     'Items are overlapped'),
    ('misaligned_items', 'svg-subproblem-misaligned.svg',
     'Items are misaligned'),
    ('items_not_visible', 'svg-subproblem-items-not-visible.svg',
     'Items not fully visible')
]

video_bug_choices = [
    ('images_not_loaded', 'svg-subproblem-no-video.svg', 'There is no video'),
    ('overlapped_items', 'svg-subproblem--no-audio.svg', 'There is no audio'),
    ('misaligned_items', 'svg-subproblem-missing-controls.svg',
     'Media controls are broken or missing'),
    ('items_not_visible', 'svg-subproblem-does-not-play.svg',
     'The video or audio does not play')
]

browser_choices = [
    ('Chrome', 'svg-chrome.svg', 'Chrome'),
    ('Edge', 'svg-edge.svg', 'Edge'),
    ('Safari', 'svg-safari.svg', 'Safari'),
    ('Opera', 'svg-opera.svg', 'Opera'),
    ('Internet Explorer', 'svg-ie.svg', 'Internet Explorer'),
    ('Other', 'svg-other.svg', 'Other')
]

tested_elsewhere = [
    ('yes', 'Yes'),
    ('no', 'No')
]

url_message = 'A valid URL is required.'
image_message = ('Please select an image of the following type:'
                 ' jpg, png, gif, or bmp.')
radio_message = 'Problem type required.'
username_message = 'A valid username must be {0} characters long'.format(
    random.randrange(0, 99))

other_problem_message = 'Please provide a description.'
other_browser_message = 'Please specify the browser.'

desc_label = 'Please write a short problem summary (mandatory)'
desc_message = 'A problem summary is required.'

url_label = 'Site URL (mandatory)'
browser_test_label = 'Did you test in another browser?'
textarea_label = 'Please describe what happened, including any steps you took before you saw the problem'  # noqa

other_problem_label = 'Briefly describe the issue:'
other_browser_label = 'Browser tested'

contact_message = 'There is a mistake in the username.'  # noqa
contact_label = 'Sharing your GitHub username—without logging in—could help us with diagnosis. This will be publicly visible.'  # noqa


class PrefixedRadioField(RadioField):
    """Prefix radio field label with an image."""
    def __init__(self, *args, **kwargs):
        prefixed_choices = kwargs.pop('choices')
        template = '<div class={css_class}><img src={src}/></div> {text}'
        choices = []

        css_class = 'icon-container'
        for slug, img, text in prefixed_choices:
            filename = 'img/svg/icons/{img}'.format(img=img)
            src = url_for('static', filename=filename)
            label = Markup(template.format(
                src=src, css_class=css_class, text=text)
            )
            choice = (slug, label)
            choices.append(choice)

        kwargs['choices'] = choices
        super().__init__(*args, **kwargs)


class IssueForm(FlaskForm):
    """Define form fields and validation for our bug reporting form."""

    url = StringField(url_label,
                      [InputRequired(message=url_message)])
    browser = StringField('Is this information correct?', [Optional()])
    os = StringField('Operating System', [Optional()])
    # A dummy field to trap common bots. Users do not see that.
    username = StringField('Username',
                           [Length(max=0, message=username_message)])
    # Field for people who want to be contacted, but do not want to login
    # regex for GitHub usernames
    username_pattern = r"^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$"
    # Field definition
    contact = StringField(
        contact_label,
        [Regexp(username_pattern,
                flags=re.IGNORECASE,
                message=contact_message)])
    description = StringField(desc_label,
                              [InputRequired(message=desc_message)])

    steps_reproduce = TextAreaField(textarea_label, [Optional()])
    problem_category = RadioField([InputRequired(message=radio_message)],
                                  choices=problem_choices)
    browser_test = RadioField(browser_test_label, [Optional()],
                              choices=tested_elsewhere)
    # we filter allowed type in uploads.py
    # Note, we don't use the label programtically for this input[type=file],
    # any changes here need to be updated in form.html.
    image = FileField('Attach a screenshot image',
                      [Optional(),
                       FileAllowed(ImageUpload.ALLOWED_FORMATS,
                       image_message)])
    details = HiddenField()
    reported_with = HiddenField()
    ua_header = HiddenField()
    submit_type = HiddenField()
    extra_labels = HiddenField()
    console_logs_url = HiddenField()


class FormWizard(IssueForm):
    """Re-designed version of IssueForm to a multi step wizard form."""

    steps = NEW_ISSUE_STEPS

    browser = StringField(u'Browser', [Optional()])
    os = StringField('Operating System', [Optional()])
    description = HiddenField()

    problem_category = PrefixedRadioField(
        [InputRequired(message=radio_message)],
        choices=problem_choices_wizard
    )
    other_problem = StringField(
        other_problem_label,
        [InputRequired(message=other_problem_message)]
    )
    other_browser = StringField(
        other_browser_label,
        [InputRequired(message=other_browser_message)]
    )
    site_bug_subcategory = PrefixedRadioField(
        [InputRequired(message=radio_message)],
        choices=site_bug_choices
    )
    layout_bug_subcategory = PrefixedRadioField(
        [InputRequired(message=radio_message)],
        choices=layout_bug_choices
    )
    video_bug_subcategory = PrefixedRadioField(
        [InputRequired(message=radio_message)],
        choices=video_bug_choices
    )
    tested_browsers = PrefixedRadioField(
        [InputRequired(message=radio_message)],
        choices=browser_choices
    )


def get_form(form_data, form=IssueForm):
    """Return an instance of flask_wtf.FlaskForm.

    It receives a dictionary of everything which needs to be fed to the form.
    """
    bug_form = form()
    ua_header = form_data['user_agent']
    # Populate the form
    bug_form.browser.data = get_browser(ua_header)
    # Note: The details JSON that was POSTed to the new issue endpoint is at
    # this point a Python dict. We need to re-serialize to JSON when we store
    # its value in the hidden details form element, otherwise when we attempt
    # to decode it as JSON on form submission, it will throw (because Python
    # dicts are not valid JSON)
    bug_form.details.data = json.dumps(form_data.get('details'), indent=2)
    bug_form.extra_labels = form_data.get('extra_labels', None)
    bug_form.os.data = get_os(ua_header)
    bug_form.reported_with.data = extract_report_source(form_data)
    bug_form.ua_header.data = ua_header
    bug_form.url.data = form_data.get('url', None)
    return bug_form


def get_console_logs_url(url):
    """Return a section for console logs, or the empty string.

    This populates the named argument `{console_section}`
    inside the formatted string that `build_details` returns.
    """
    if not url:
        return ''
    return """\n
[View console log messages]({console_logs_url})""".format(console_logs_url=url)


def build_details(details):
    """Populate and return the Browser Configuration section template.

    If we get JSON, we try to pull out the console logs before building the
    rest of the details.
    """
    try:
        content = json.loads(details)
        if is_json_object(content):
            content.pop('consoleLog', None)
    except ValueError:
        # if we got a ValueError, details was a string, so just pass it
        # into get_details below
        content = details
    return """<details>
<summary>Browser Configuration</summary>
{details_list_items}
</details>""".format(details_list_items=get_details_list(content))


def get_radio_button_label(field_value, label_list):
    """Return human-readable label for problem choices form value."""
    for value, text in label_list:
        if value == field_value:
            return text
    # Something probably went wrong. Return something safe.
    return 'Unknown'


def get_problem_summary(category):
    """Create the summary for the issue title."""
    if category == 'unknown_bug':
        # In this case, we need a special message
        return 'see bug description'
    else:
        # Return the usual message in lowercase
        # because it is not at the start of the summary.
        return get_radio_button_label(category, problem_choices).lower()


def wrap_metadata(metadata):
    """Wrap metadata and its type in an HTML comment.

    We use it to hide potentially (un)interesting metadata from the UI.
    """
    return '<!-- @{0}: {1} -->\n'.format(*metadata)


def get_metadata(metadata_keys, form_object):
    """Return relevant metadata hanging off the form as a single string."""
    extra_labels = []
    if 'extra_labels' in metadata_keys:
        extra_labels = [normalize_metadata(label)
                        for label in form_object.get('extra_labels')
                        if label in app.config['EXTRA_LABELS']]
        metadata_keys.remove('extra_labels')
    metadata = [(key, form_object.get(key)) for key in metadata_keys]
    metadata = [(md[0], normalize_metadata(md[1])) for md in metadata]
    if extra_labels:
        metadata.append(('extra_labels', ', '.join(extra_labels)))
    # Now, "wrap the metadata" and return them all as a single string
    return ''.join([wrap_metadata(md) for md in metadata])


def normalize_url(url):
    """Normalize URL for consistency."""
    if not url:
        return None
    url = url.strip()
    parsed = urllib.parse.urlparse(url)
    # Handle the case when URL has the form http://https://example.com
    if parsed.netloc in ['http:', 'https:'] and parsed.path.startswith('//'):
        url = url.split('//', 1)[1]
    # Clean the URL.
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
        if url.startswith('//'):
            url = 'http://{}'.format(url[2:])
        else:
            url = 'http://{}'.format(url)
    return url


def normalize_metadata(metadata_value):
    """Normalize the metadata received from the form."""
    # Removing closing comments.
    if metadata_value is None:
        return None
    if '-->' in metadata_value:
        metadata_value = metadata_value.replace('-->', '')
        metadata_value = normalize_metadata(metadata_value)
    # Let's avoid html tags in
    if ('<' or '>') in metadata_value and '-->' not in metadata_value:
        metadata_value = ''
    if len(metadata_value) > 200:
        metadata_value = ''
    return metadata_value.strip()


def domain_name(url):
    """Extract the domain name of a sanitized version of the submitted URL."""
    # Removing leading spaces
    if not url:
        return None
    url = url.lstrip()
    # testing if it's an http URL
    if url.startswith(SCHEMES):
        domain = urllib.parse.urlsplit(url).netloc
    else:
        domain = None
    return domain


def add_metadata(form, metadata_dict):
    """Method to add additional arbitrary metadata objects.

    Returns the form object.
    """
    form['extra_metadata'] = metadata_dict
    return form


def extract_report_source(form_data):
    """Extract the source of report.

    This also controls if the src argument is part of a known list.
    """
    reported_with = 'unknown'
    try:
        reported_with = form_data['src']
        if not is_valid_source(reported_with):
            reported_with = 'unknown'
    except KeyError:
        reported_with = 'web'
    return reported_with


def is_valid_source(reported_with):
    """Only a known subset of known values are accepted."""
    if reported_with in app.config['REPORTED_WITH']:
        return True
    return False


def build_formdata(form_object):
    """Convert HTML form data to GitHub API data.

    Summary -> title
    Version -> part of body
    URL -> part of body
    Category -> labels
    Details -> part of body
    Description -> part of body
    Browser -> part of body, labels
    OS -> part of body, labels
    Tested Elsewhere -> body
    Image Upload -> part of body

    We'll try to parse the Browser and come up with a browser label, as well
    as labels like mobile, desktop, tablet.

    Here's a description of what the Issues API expects to create an issue

    --------------------------------------------------------------------------
    | title    | string            | The title of the issue. Required.       |
    | body     | string            | The contents of the issue.              |
    | labels   | array of strings  | Labels to associate with this issue.    |
    | milestone| integer           | Milestone to associate with this issue. |
    --------------------------------------------------------------------------

    NOTE: Only users with push access can set labels for new issues.
    Labels are silently dropped otherwise.
    NOTE: intentionally leaving out `assignee`.
    NOTE: Add milestone "needstriage" when creating a new issue
    """
    # Do domain extraction for adding to the summary/title
    # form_object always returns a unicode string
    url = form_object.get('url')
    normalized_url = normalize_url(url)
    domain = domain_name(normalized_url)
    problem_summary = get_problem_summary(form_object.get('problem_category'))

    if domain:
        summary = '{0} - {1}'.format(domain, problem_summary)
    else:
        summary = '{0} - {1}'.format(normalized_url, problem_summary)

    metadata_keys = ['browser', 'ua_header', 'reported_with']
    extra_labels = form_object.get('extra_labels', None)
    if extra_labels:
        metadata_keys.append('extra_labels')
    extra_metadata = form_object.get('extra_metadata', None)
    if extra_metadata:
        for key in extra_metadata.keys():
            form_object[key] = extra_metadata[key]
            metadata_keys.append(key)

    formdata = {
        'metadata': get_metadata(metadata_keys, form_object),
        'url': normalized_url,
        'browser': normalize_metadata(form_object.get('browser')),
        'os': normalize_metadata(form_object.get('os')),
        'problem_type': get_radio_button_label(
            form_object.get('problem_category'), problem_choices),
        'browser_test_type': get_radio_button_label(form_object.get(
            'browser_test'), tested_elsewhere),
        'description': form_object.get('description'),
        'steps_reproduce': form_object.get('steps_reproduce'),
        'tested_browsers': form_object.get('tested_browsers', ''),
    }

    # Preparing the body

    body = """{metadata}
**URL**: {url}

**Browser / Version**: {browser}
**Operating System**: {os}
**Tested Another Browser**: {browser_test_type} {tested_browsers}

**Problem type**: {problem_type}
**Description**: {description}
**Steps to Reproduce**:
{steps_reproduce}

""".format(**formdata)
    # Append details info, if any.
    details = form_object.get('details')
    if details:
        body += build_details(details)
    body += get_console_logs_url(form_object.get('console_logs_url'))
    # Add the image, if there was one.
    if form_object.get('image_upload') is not None:
        body += '\n\n![Screenshot of the site issue]({image_url})'.format(
            image_url=form_object.get('image_upload').get('url'))
    # Append contact information if available
    contact = form_object.get('contact', '')
    # This probably deserves its own function.
    contact = contact.strip()
    contact = contact.replace('@', '')
    if contact and not g.user:
        body += '\n\nSubmitted in the name of `@{contact}`'.format(
            contact=contact)
    # Append "from webcompat.com" message to bottom (for GitHub issue viewers)
    body += '\n\n{0}'.format(GITHUB_HELP)
    rv = {'title': summary, 'body': body}
    return rv
