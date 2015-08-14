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
      }
    };
  });
});
