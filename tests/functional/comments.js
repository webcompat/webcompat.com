/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, FunctionalHelpers) {
  'use strict';

  var url = function(num) {
    return intern.config.siteRoot + '/issues/' + num;
  };

  registerSuite({
    name: 'issues',

    'Comments form visible when logged in': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .findByCssSelector('.Comment--form').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Comment form visible for logged in users.');
        })
        .end()
    },

    'Comment form not visible for logged out users': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        // logout
        .findByCssSelector('.wc-Navbar-section--right .wc-Navbar-link').click()
        .end()
        // make sure the comment form isn't on the page
        FunctionalHelpers.noElementByCssSelector(this, '.Comment--form')
        .end();
    }

  });
});
