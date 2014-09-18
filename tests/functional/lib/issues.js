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
  }

  registerSuite({
    name: 'issues',

    'issue page loads': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(1000)
        .findByCssSelector('h2.issue__main_title').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Issue 100:', 'Issue title displayed');
        })
        .end()
        .findByCssSelector('.issue__reporter').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'miketaylr', 'Issue reporter displayed.');
        })
        .end()
        .findByCssSelector('.issue__label_item').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    'issue comments load': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(1000)
        .findByCssSelector('.issue__comment').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .findByCssSelector('.comment__owner').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'miketaylr', 'Commenter name displayed.');
        })
        .end()
        .findByCssSelector('#issuecomment\-46221406').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Comment ID is set properly');
        })
        .sleep(1000)
        .findByCssSelector('.comment__content').getVisibleText()
        .then(function (text) {
          assert.equal(text, '1', 'Comment is displayed.');
        });
    },

    'non-existant issues go to 404': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        // TODO: uh, update this in the future
        .get(require.toUrl(url(999999)))
        .findByCssSelector('#pageerror h2').getVisibleText()
        .then(function (text) {
          assert.include(text, "(404)", "We\'re at the 404.");
        })
    }

    'closing an issue': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(1)))
        .findByCssSelector('button.Button.Button--action').submit()
        .end()
        .findByCssSelector('button.Button.Button--action').getVisibleText()
        .then(function (text) {
          assert.equal(text, "Reopen and comment");
        })
        .end();
        })
    }

  });
});
