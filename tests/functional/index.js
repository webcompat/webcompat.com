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
        .findByCssSelector('.wc-Hero-title').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bug reporting\nfor the internet.');
        })
        .end();
    },

    'reporter addon link is shown': function () {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('.wc-Navbar-link').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Download our Firefox');
        })
        .end();
    },

    'form toggles open then closed': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('#report-bug.closed').click()
        .end()
        .findByCssSelector('.form-opened').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        .findByCssSelector('#report-bug.is-open').click()
        .end()
        .findByCssSelector('.form-closed').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, false);
        });
    },

    'browse issues (new)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findAllByCssSelector('#new .wc-IssueItem.wc-IssueItem--new')
        .then(function (elms) {
          assert.equal(elms.length, 5, '5 issues should be displayed');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-metadata:nth-child(1)').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}/, 'Issue should display creation date');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-metadata:nth-child(2)').getVisibleText()
        .then(function (text) {
          assert.match(text, /Comments:\s\d/, 'Issue should display number of comments');
        })
        .end();
    }
  });
});
