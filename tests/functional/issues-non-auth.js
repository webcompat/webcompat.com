/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function(intern, registerSuite, assert, require) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'issues',

    'Issue page loads': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .sleep(1000)
        .findByCssSelector('h1.wc-IssueDetail-title').getVisibleText()
        .then(function(text) {
          assert.include(text, 'Issue 100:', 'Issue title displayed');
        })
        .end()
        .findByCssSelector('.wc-IssueDetail-reporter').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'miketaylr', 'Issue reporter displayed.');
        })
        .end()
        .findByCssSelector('.Label--badge').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    'Issue comments load': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .sleep(1000)
        .findByCssSelector('.js-issue-comment').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .findByCssSelector('.wc-Comment-owner').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'GIGANTOR', 'Commenter name displayed.');
        })
        .end()
        .sleep(500)
        .findByCssSelector('.wc-Comment-content').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Today\'s date is Mon Sep 28 2015', 'Comment is displayed.');
        });
    },

    'Pressing g goes to the github issue page': function() {
      var issueNumber = 100;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/' + issueNumber)))
        .findByCssSelector('body').click()
        .type('g')
        .end()
        // look for the issue container on github.com/foo/bar/issues/N
        .findByCssSelector('.gh-header.issue').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'We\'re at the GitHub issue page now.');
        })
        .end()
        .findByCssSelector('.gh-header-number').getVisibleText()
        .then(function(text) {
          var headerNumber = parseInt(text.slice(1), 10);
          assert.equal(headerNumber, issueNumber, 'GitHub issue number matches.');
        });
    },

    'Opening the QR code image (via button)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/252')))
        // Click on QR code button to open
        .findByCssSelector('.wc-QrImage-launcher').click()
        .end()
        .findByCssSelector('.wc-QrImage').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end();
    },

    'Closing the QR code image (via button)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/252')))
        // Click on QR code button to open
        .findByCssSelector('.wc-QrImage-launcher').click()
        .end()
        .findByCssSelector('.wc-QrImage').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        // Click on QR code button again to close
        .findByCssSelector('.wc-QrImage-launcher.is-active').click()
        .end()
        .findByCssSelector('.wc-QrImage').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, false);
        })
        .end();
    },

    'Opening the QR code image (via keyboard shortcut)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/252')))
        // Click on QR code button to open
        .findByCssSelector('body').click()
        .type('q')
        .end()
        .findByCssSelector('.wc-QrImage').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end();
    },

    'Closing the QR code image (via link)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/252')))
        // Click on QR code button to open
        .findByCssSelector('.wc-QrImage-launcher').click()
        .end()
        .findByCssSelector('.wc-QrImage').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        // Click on QR code Close link to close
        .findByCssSelector('.wc-QrImage-btn').click()
        .end()
        .findByCssSelector('.wc-QrImage').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, false);
        })
        .end();
    }
  });
});
