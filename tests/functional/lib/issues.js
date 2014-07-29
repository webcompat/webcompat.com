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

  var url = intern.config.siteRoot + '/issues/100';

  registerSuite({
    name: 'issues',

    'issue page loads': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
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
        .get(require.toUrl(url))
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
        .findByCssSelector('.comment__content').getVisibleText()
        .then(function (text) {
          assert.equal(text, '1', 'Comment is displayed.');
        });
    }

  });
});
