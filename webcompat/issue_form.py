# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from wtforms import (Form, BooleanField, RadioField, StringField,
                     TextAreaField, validators)

class IssueForm(Form):
    url = StringField('Site URL', [validators.InputRequired(), validators.URL()])
    site_owner = RadioField('Is this your website?',
                            choices=[('site_owner_yes', 'Yes'),
                                     ('site_owner_no', 'No')])
    problem_category = RadioField('What seems to be the trouble?',
                           choices=[('browser_bug', 'Looks like the browser has a bug'),
                                    ('site_bug', 'Looks like the website has a bug.'),
                                    ('dunno', 'I don\'t know but something\'s wrong.')])
    browser = StringField('Browser')
    version = StringField('Version')
    problem = StringField('Problem in 5 words') # do we want validation here?
    description = TextAreaField('How can we replicate this?')