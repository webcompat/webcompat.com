/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'tests/functional/lib/helpers'
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'Comments (auth)',

    setup: function() {
      return FunctionalHelpers.login(this);
    },

    teardown: function() {
      return FunctionalHelpers.logout(this);
    },

    'Comments form visible when logged in': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .sleep(2000)
        .findByCssSelector('.js-comment-form').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'Comment form visible for logged in users.');
        })
        .end();
    },


    'Empty vs non-empty comment button text (open issue)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .findByCssSelector('.js-issue-comment:nth-of-type(3)')
        .end()
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal('Close Issue', text);
          assert.notEqual('Close and comment', text);
        })
        .end()
        .findByCssSelector('textarea.js-comment-text')
        .type('test comment')
        .end()
        .sleep(1000)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal('Close and comment', text);
          assert.notEqual('Close Issue', text);
        });
    },

    'Empty vs non-empty comment button text (closed issue)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/101')))
        .findByCssSelector('.js-issue-comment:nth-of-type(3)')
        .end()
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal('Reopen Issue', text);
          assert.notEqual('Reopen and comment', text);
        })
        .end()
        .findByCssSelector('textarea.js-comment-text')
        .type('test comment')
        .end()
        .sleep(1000)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text) {
          assert.equal('Reopen and comment', text);
          assert.notEqual('Reopen Issue', text);
        });
    },

    'Posting a comment': function() {
      var originalCommentsLength;
      var allCommentsLength;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .findAllByCssSelector('.js-issue-comment')
        .then(function(elms) {
          originalCommentsLength = elms.length;
        })
        .end()
        .findByCssSelector('textarea.js-comment-text')
        .type('Today\'s date is ' + new Date().toDateString())
        .end()
        .sleep(2000)
        // click the comment button
        .findByCssSelector('.js-issue-comment-button').click()
        .end()
        .sleep(2000)
        .findAllByCssSelector('.js-issue-comment')
        .then(function(elms) {
          allCommentsLength = elms.length;
          assert(originalCommentsLength < allCommentsLength, 'Comment was successfully left.');
        });
    },

    'Posting an empty comment fails': function() {
      var originalCommentsLength;
      var allCommentsLength;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .findAllByCssSelector('.js-issue-comment')
        .then(function(elms) {
          originalCommentsLength = elms.length;
        })
        .end()
        // click the comment button
        .findByCssSelector('.js-issue-comment-button').click()
        .end()
        .sleep(500)
        .findAllByCssSelector('.js-issue-comment')
        .then(function(elms) {
          allCommentsLength = elms.length;
          assert(originalCommentsLength === allCommentsLength, 'Comment was not successfully left.');
        });
    }

  });
});
