# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from webcompat import app


@app.template_filter('format_date')
def last_modified_format(value):
    return value.strftime('%B %d, %Y.')
