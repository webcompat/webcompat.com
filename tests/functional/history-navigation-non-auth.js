/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/functional/lib/helpers',
  'require'
], function(intern, registerSuite, assert, FunctionalHelpers, require) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'History navigation',

    'Back button works from issues page': function() {
      return this.remote
        .get(require.toUrl(url('/')))
        .findByCssSelector('.js-issues-link').click()
        .end()
        .then(FunctionalHelpers.visibleByQSA('.js-IssueList:nth-child(1)'))
        .end()
        .goBack()
        // now check that we're back at the home page.
        .findByCssSelector('.js-Hero-title').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Bug reporting\nfor the internet.');
        })
        .end();
    }
  });
});
