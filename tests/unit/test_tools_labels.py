#!/usr/bin/env python
# -*- coding: utf-8 -*-
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Tests for the label functions."""

import unittest

from tools.labels import get_issue_labels
from tools.labels import USER_LABELS_URI


class TestLabels(unittest.TestCase):
    """Test for label operations."""

    def setUp(self):
        """Set up the tests."""
        pass

    def tearDown(self):
        """Tear down the tests."""
        pass

    def test_get_issue_labels(self):
        """Fetch all labels from GitHub."""
        actual = get_issue_labels(USER_LABELS_URI)
        self.assertEqual(len(actual), 32)

    def test_create_label(self):
        """Create a label in the user repo."""
        pass

    def test_delete_label(self):
        """Delete a label in the user repo."""
        pass


if __name__ == '__main__':
    unittest.main()
