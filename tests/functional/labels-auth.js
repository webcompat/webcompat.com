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

  registerSuite(function () {

    var url = function (path) {
      return intern.config.siteRoot + path;
    };

    return {
      name: 'labels',

      setup: function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/2')))
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

    teardown: function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .findByCssSelector('.js-login-link').click()
        .end()
        .clearCookies()
        .end()
        .get(require.toUrl('https://github.com/logout'))
        .findByCssSelector('.auth-form-body input.btn').click()
        .end();
    },

      'Label gear is visible': function () {
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues/2')))
          .findByCssSelector('.LabelEditor-wrapper')
          .isDisplayed()
          .then(function (displayed) {
            assert.isTrue(displayed, 'The label gear icon is visible once logged');
          })
          .end();
      },

      'Label widget is opening on click': function () {
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues/2')))
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
          .get(require.toUrl(url('/issues/2')))
          .findByCssSelector('.LabelEditor-launcher').click()
          .end()
          .findByCssSelector('label.LabelEditor-item input[name="contactready"]').click()
          .end()
          .sleep(500)
          .findByCssSelector('.Label--badge').getVisibleText()
          .then(function (labelText) {
            assert.include(labelText, 'contactready', 'Label appears once it has been selected');
          })
          .end();
      },

      'Label has been sent to GitHub': function () {
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues/2')))
          .findByCssSelector('.LabelEditor-launcher').click()
          .end()
          .findByCssSelector('label.LabelEditor-item input[name="contactready"]').click()
          .end()
          .findByCssSelector('.LabelEditor-btn').click()
          .end()
          .refresh()
          .findByCssSelector('.Label--badge')
          .getVisibleText()
          .then(function (labelText) {
            assert.include(labelText, 'contactready', 'Label has been set on Github');
          })
          .end();
      },

      'Removes a label': function () {
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues/2')))
          .findByCssSelector('.LabelEditor-launcher').click()
          .end()
          .findByCssSelector('label.LabelEditor-item input[name="contactready"]').click()
          .end()
          .findByCssSelector('.LabelEditor-btn').click()
          .end()
          .get(require.toUrl(url('/issues/2')))
          .findByCssSelector('.Label--badge')
          .getVisibleText()
          .then(function (labelText) {
            assert.include(labelText, 'contactready', 'Label has been removed');
          })
          .end();
      }
    };
  });
});
