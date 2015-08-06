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

  var url = function (num) {
    return intern.config.siteRoot + '/issues/' + num;
  };

  registerSuite({
    name: 'labels',

    'log in': function () {
      // for testing labels we need to be logged.
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .findByCssSelector('.js-login-link').click()
        .end()
        .findByCssSelector('#login_field').click()
        .type(intern.config.wc.user)
        .end()
        .findByCssSelector('#password').click()
        .type(intern.config.wc.pw)
        .end()
        .findByCssSelector('input[type=submit]').submit()
        .end()
        .findByCssSelector('button').submit()
        .end();
    },

        'label gear is visible': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .findByCssSelector('.LabelEditor-wrapper')
        .isDisplayed()
        .then(function (displayed) {
          assert.isTrue(displayed, 'The label gear icon is visible once logged');
        })
        .end();
    }
  });
});
