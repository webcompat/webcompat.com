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

    setup: function () {
      // We should be logged before starting the labels test.
      // The setup function should make sure we are not logged.
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(2)))
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
        .get(require.toUrl(url(2)))
        .findByCssSelector('.LabelEditor-wrapper')
        .isDisplayed()
        .then(function (displayed) {
          assert.isTrue(displayed, 'The label gear icon is visible once logged');
        })
        .end();
    },

    'label widget is opening on click': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(2)))
        .findByCssSelector('.LabelEditor-launcher').click()
        .end()
        .findByCssSelector('.LabelEditor')
        .isDisplayed()
        .then(function (displayed) {
          assert.isTrue(displayed, 'The label editor widget is open');
        })
        .end();
    },

    'Label appears once selected': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(2)))
        .findByCssSelector('.LabelEditor-launcher').click()
        .end()
        .findByCssSelector('label.LabelEditor-item input[name="contactready"]').click()
        .end()
        .findByCssSelector('.form-control').click()
        .end()
        .findByCssSelector('.Label--badge')
        .getVisibleText()
        .then(function (text) {
          assert.include(text, 'contactready', 'Label appears once it has been selected');
        })
        .end();
    }

  });
});
