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
    name: 'history navigation',

    'Back button works from issues page': function () {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('.js-issues-link').click()
        .end()
        //find an issue so we know the page has loaded
        .findByCssSelector('div.wc-IssueItem:nth-child(1)')
        .end()
        .goBack()
        // now check that we're back at the home page.
        .findByCssSelector('.wc-Hero-title').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bug reporting\nfor the internet.');
        })
        .end();
    }
  });
});
