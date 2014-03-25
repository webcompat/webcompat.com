# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from wtforms import Form, RadioField, StringField, TextAreaField
from wtforms.validators import Optional, Required


owner_choices = [('site_owner_yes', 'Yes'), ('site_owner_no', 'No')]
problem_choices = [('browser_bug', 'Looks like the browser has a bug'),
                   ('site_bug', 'Looks like the website has a bug.'),
                   ('dunno', 'I don\'t know but something\'s wrong.')]
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
