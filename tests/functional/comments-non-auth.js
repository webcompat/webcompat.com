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

    'Comment form not visible for logged out users': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(200)))
        .findByCssSelector('.js-login-link').click()
        .end()
        .findByCssSelector('.wc-Comment--form')
        .then(assert.fail, function(err) {
           assert.isTrue(/NoSuchElement/.test(String(err)));
        })
        .end()
        .findByCssSelector('.js-login-link').click()
        .end();
    }

  });
});
