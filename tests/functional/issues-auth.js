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

    'Issue page loads': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(1000)
        .findByCssSelector('h1.wc-IssueDetail-title').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Issue 100:', 'Issue title displayed');
        })
        .end()
        .findByCssSelector('.wc-IssueDetail-reporter').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'miketaylr', 'Issue reporter displayed.');
        })
        .end()
        .findByCssSelector('.Label--badge').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    'Closing and reopening an issue': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(69)))
        .findByCssSelector('.js-issue-state-button').click()
        .sleep(2000)
        .end()
        .findByCssSelector('.wc-IssueDetail-state').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Closed', 'Closed state text is displayed');
        })
        .end()
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Reopen Issue', 'Button says Reopen not Close');
        })
        .end()
        .findByCssSelector('.js-issue-state-button').click()
        .sleep(2000)
        .end()
        .findByCssSelector('.wc-IssueDetail-state').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Ready for Outreach', 'Ready for Outreach state is displayed');
        })
        .end()
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Close Issue', 'Button says Close not Reopen');
        });
    }

  });
});
