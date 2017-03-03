/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
This file is provided so we can run tests on Travis for pull requests
from forks that don't have access to encrypted environment variables.

node_modules/.bin/intern-runner config=tests/intern \
                                functionalSuites=tests/functional-nonauth
*/

define([
  "./functional/reporting-non-auth.js",
  "./functional/comments-non-auth.js",
  "./functional/contributors-non-auth.js",
  "./functional/history-navigation-non-auth.js",
  "./functional/image-uploads-non-auth.js",
  "./functional/index-non-auth.js",
  "./functional/issue-list-non-auth.js",
  "./functional/issues-non-auth.js",
  "./functional/new-issue-non-auth.js",
  "./functional/search-non-auth.js"
], function() {
  "use strict";
});
