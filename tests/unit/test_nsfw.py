#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for Siterank class."""

import unittest
import webcompat
from webcompat.nsfw import moderate_screenshot


class TestNSFW(unittest.TestCase):
    """Tests for Top Sites Alexa class."""

    def setUp(self):
        """Set up the tests."""
        webcompat.app.config['TESTING'] = True

        self.issue_body_with_screenshot = """
        <!-- @browser: Firefox 94.0 -->
        <!-- @ua_header: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0 -->
        <!-- @reported_with: desktop-reporter -->
        <!-- @public_url: https://github.com/webcompat/webcompat-tests/issues/2710 -->
        <!-- @extra_labels: type-webrender-enabled -->

        **URL**: http://aturemlaguerra.org/

        **Browser / Version**: Firefox 94.0
        **Operating System**: Mac OS X 10.15
        **Tested Another Browser**: Yes Chrome

        **Problem type**: Site is not usable
        **Description**: Buttons or links not working
        **Steps to Reproduce**:
        gawrhs agrhsrthse sethsrthserhserhser
        <details>
              <summary>View the screenshot</summary>
              <img alt="Screenshot" src="https://staging.webcompat.com/uploads/2021/9/31053f87-a71a-4241-8b47-b2c388545d14.jpeg">
        </details>
        """  # noqa

        self.issue_body_moderated = """
        <!-- @browser: Firefox 94.0 -->
        <!-- @ua_header: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0 -->
        <!-- @reported_with: desktop-reporter -->
        <!-- @public_url: https://github.com/webcompat/webcompat-tests/issues/2710 -->
        <!-- @extra_labels: type-webrender-enabled -->

        **URL**: http://aturemlaguerra.org/

        **Browser / Version**: Firefox 94.0
        **Operating System**: Mac OS X 10.15
        **Tested Another Browser**: Yes Chrome

        **Problem type**: Site is not usable
        **Description**: Buttons or links not working
        **Steps to Reproduce**:
        gawrhs agrhsrthse sethsrthserhserhser
        <details>
              <summary>View the screenshot</summary>
              Screenshot removed - possible explicit content.
        </details>
        """  # noqa

        self.issue_body_no_screenshot = """
        <!-- @browser: Firefox 94.0 -->
        <!-- @ua_header: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:94.0) Gecko/20100101 Firefox/94.0 -->
        <!-- @reported_with: desktop-reporter -->
        <!-- @public_url: https://github.com/webcompat/webcompat-tests/issues/2710 -->
        <!-- @extra_labels: type-webrender-enabled -->

        **URL**: http://aturemlaguerra.org/

        **Browser / Version**: Firefox 94.0
        **Operating System**: Mac OS X 10.15
        **Tested Another Browser**: Yes Chrome

        **Problem type**: Site is not usable
        **Description**: Buttons or links not working
        **Steps to Reproduce**:
        gawrhs agrhsrthse sethsrthserhserhser
        """  # noqa

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_moderate_screenshot(self):
        """Moderate screenshot and remove image tag."""
        body = moderate_screenshot(self.issue_body_with_screenshot)
        self.assertEqual(body, self.issue_body_moderated)

    def test_no_screenshot_unchanged(self):
        """Body remains unchanged if there is no screenshot."""
        body = moderate_screenshot(self.issue_body_no_screenshot)
        self.assertEqual(body, self.issue_body_no_screenshot)


if __name__ == '__main__':
    unittest.main()
