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

  var url = function(num) {
    return intern.config.siteRoot + '/issues/' + num;
  };

  registerSuite({
    name: 'issues',

    'issue page loads': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(1000)
        .findByCssSelector('h1.Issue-title').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Issue 100:', 'Issue title displayed');
        })
        .end()
        .findByCssSelector('.Issue-reporter').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'miketaylr', 'Issue reporter displayed.');
        })
        .end()
        .findByCssSelector('.Label--badge').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    'issue comments load': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(1000)
        .findByCssSelector('.Comment').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .findByCssSelector('.Comment-owner').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'miketaylr', 'Commenter name displayed.');
        })
        .end()
        .sleep(500)
        .findByCssSelector('.Comment-content').getVisibleText()
        .then(function (text) {
          assert.equal(text, '1', 'Comment is displayed.');
        });
    },

    'non-existant issues go to 404': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        // TODO: uh, update this in the future
        .get(require.toUrl(url(999999)))
        .findByCssSelector('#pageerror h1').getVisibleText()
        .then(function (text) {
          assert.include(text, '(404)', 'We\'re at the 404.');
        });
    },

    'pressing g goes to the github issue page': function() {
      var issueNumber = 100;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(issueNumber)))
        .findByCssSelector('body').click()
        .type('g')
        .end()
        // look for the issue container on github.com/foo/bar/issues/N
        .findByCssSelector('.gh-header.issue').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'We\'re at the GitHub issue page now.');
        })
        .end()
        .findByCssSelector('.gh-header-number').getVisibleText()
        .then(function(text) {
          var headerNumber = parseInt(text.slice(1), 10);
          assert.equal(headerNumber, issueNumber, 'GitHub issue number matches.');
        });
    }

  });
});
