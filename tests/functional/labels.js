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

    var url = function (num) {
      return intern.config.siteRoot + '/issues/' + num;
    };

    return {
      name: 'labels',

      setup: function () {
        // We should be logged before starting the labels test.
        // The setup function should make sure we are not logged.
      },

      teardown: function () {
        // The teardown should remove all labels which would have
        // been put during the process, specifically if it fails
        // in the middle of testing.
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
      }
    };
  });
});
