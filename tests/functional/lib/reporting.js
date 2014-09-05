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
    name: 'reporting anonymously',

    'anonymous report': function () {
      var issueNumber;

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + "?open=1"))
        .findByCssSelector('#url').type('http://miketaylr.com')
        .end()
        .findByCssSelector('#summary').type('Hello from Intern')
        .end()
        .findByCssSelector('#submitanon').click()
        .end()
        .findByCssSelector('.wc-content--body h2').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Thank you.');
        })
        .end()
        .findByCssSelector('.wc-content--body a').getVisibleText()
        .then(function (text) {
          issueNumber = text.split('/').pop();
        })
        .end()
        .findByCssSelector('.wc-content--body a').getVisibleText().click()
        .end()
        .findByCssSelector('.js-issue-title').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'miketaylr.com - Hello from Intern');
        })
        .end()
        .findByCssSelector('.gh-header-number').getVisibleText()
        .then(function (text) {
          assert.equal(text, '#' + issueNumber);
        })
    },

  });
});
