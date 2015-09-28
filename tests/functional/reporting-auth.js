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
    name: 'reporting',

    'Report button shows name': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // wait a second
        .sleep(1000)
        .findByCssSelector('#submitgithub').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Report as'); //Report as FooUser (logged in)
        })
        .end();
    }

  });
});
