/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

To run a single test suite, use the following from the project root.

node_modules/.bin/intern-runner config=tests/intern functionalSuites=tests/functional/foo.js user="username" pw="secret_lies"
*/

define([
  './functional/comments-auth.js',
  './functional/comments-non-auth.js',
  './functional/contributors-non-auth.js',
  './functional/history-navigation-non-auth.js',
  './functional/index-non-auth.js',
  './functional/issue-list-auth.js',
  './functional/issue-list-non-auth.js',
  './functional/issues-auth.js',
  './functional/issues-non-auth.js',
  './functional/labels-auth.js',
  './functional/reporting-auth.js',
  './functional/reporting-non-auth.js'
], function () {
  'use strict';
});
