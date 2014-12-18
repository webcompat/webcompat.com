/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
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
        .sleep(1000)
        .findByCssSelector('.Comment--form').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Comment form visible for logged in users.');
        })
        .end()
        .findByCssSelector('.wc-Navbar-section--right .wc-Navbar-link').click()
        .end()
        .findAllByCssSelector('.Comment--form').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, false, 'Comment form hidden visible for logged out users.');
        });
    }

  });
});
