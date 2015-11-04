/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'Issues (auth)',

    setup: function() {
      return FunctionalHelpers.login(this);
    },

    teardown: function() {
      return FunctionalHelpers.logout(this);
    },

    'Closing and reopening an issue': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/69')))
        .findByCssSelector('.js-issue-state-button').click()
        .sleep(2000)
        .end()
        .findByCssSelector('.wc-IssueDetail-state').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Closed', 'Closed state text is displayed');
        })
        .end()
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Reopen Issue', 'Button says Reopen not Close');
        })
        .end()
        .findByCssSelector('.js-issue-state-button').click()
        .sleep(2000)
        .end()
        .findByCssSelector('.wc-IssueDetail-state').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Ready for Outreach', 'Ready for Outreach state is displayed');
        })
        .end()
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Close Issue', 'Button says Close not Reopen');
        });
    }

  });
});
