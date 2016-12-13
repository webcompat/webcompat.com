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
        .then(FunctionalHelpers.visibleByQSA('.js-Issue-state-button'))
        .findByCssSelector('.js-Issue-state-button').click()
        .end()
        .then(FunctionalHelpers.visibleByQSA('.wc-Issue-information-header:contains(Closed)'))
        .findByCssSelector('.wc-Issue-information-header').getVisibleText()
        .then(function(text) {
          assert.include(text, 'Closed', 'Closed state text is displayed');
        })
        .end()
        .findByCssSelector('.js-Issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Reopen Issue', 'Button says Reopen not Close');
        })
        .end()
        .findByCssSelector('.js-Issue-state-button').click()
        .end()
        .then(FunctionalHelpers.visibleByQSA('.wc-Issue-information-header:contains(Ready)'))
        .findByCssSelector('.wc-Issue-information-header').getVisibleText()
        .then(function(text) {
          assert.include(text, 'Ready for Outreach', 'Ready for Outreach state is displayed');
        })
        .end()
        .findByCssSelector('.js-Issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Close Issue', 'Button says Close not Reopen');
        });
    }

  });
});
