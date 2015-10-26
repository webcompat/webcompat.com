/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function (intern, registerSuite, assert, require, FunctionalHelpers) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'User Activity (auth)',

    setup: function () {
      return FunctionalHelpers.login(this);
    },

    teardown: function () {
      return FunctionalHelpers.logout(this);
    },

    'We\'re at the right place': function() {
      var username;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/me')))
        .findByCssSelector('.wc-content--body .wc-Title--l').getVisibleText()
        .then(function(text){
          var usernameEnd = text.indexOf("'s activity");
          username = text.slice(0, usernameEnd);
        })
        .getCurrentUrl()
        .then(function(currURL){
          assert.include(currURL, username, 'The redirected URL has our username in it.');
        })
        .end();
    },

    'IssueListView renders': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/me')))
        .findByCssSelector('.wc-IssueList').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList container is visible.');
        })
        .sleep(1000)
        .end()
        .findByCssSelector('.wc-IssueList .wc-IssueItem').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList item is visible.');
        })
        .end()
        .findByCssSelector('.wc-IssueItem .wc-IssueItem-header').getVisibleText()
        .then(function(text){
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem:nth-child(1) > div:nth-child(1) > p:nth-child(2)').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/i, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    }

  });
});
