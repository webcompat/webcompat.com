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

  registerSuite(function() {

    var url = function(path) {
      return intern.config.siteRoot + path;
    };

    return {
      name: 'Labels (auth)',

      setup: function() {
        return FunctionalHelpers.login(this);
      },

      teardown: function() {
        return FunctionalHelpers.logout(this);
      },

      'Label gear is visible': function() {
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues/2')))
          .then(FunctionalHelpers.visibleByQSA('.js-Issue-labelEditor'))
          .findByCssSelector('.js-Issue-labelEditor').isDisplayed()
          .then(function(displayed) {
            assert.isTrue(displayed, 'The label gear icon is visible once logged');
          })
          .end();
      },

      'Label widget is opening on click': function() {
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues/2')))
          .findByCssSelector('.js-LabelEditorLauncher').click()
          .end()
          .then(FunctionalHelpers.visibleByQSA('.js-LabelEditor'))
          .findByCssSelector('.js-LabelEditor').isDisplayed()
          .then(function(displayed) {
            assert.isTrue(displayed, 'The label editor widget is open');
          })
          .end();
      }
    };
  });
});
