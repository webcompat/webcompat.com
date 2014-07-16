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

  var url = intern.config.siteRoot;

  registerSuite({
    name: 'index',

    'front page loads': function () {

      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#maintitle h1').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bug reporting\nfor the internet.');
        })
        .end()
    }
  });
});
