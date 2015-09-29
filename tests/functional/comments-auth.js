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

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'issues',

    setup: function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/')))
        .findByCssSelector('.js-login-link').click()
        .end()
        .findByCssSelector('#login_field').click()
        .type(intern.config.wc.user)
        .end()
        .findByCssSelector('#password').click()
        .type(intern.config.wc.pw)
        .end()
        .findByCssSelector('input[type=submit]').submit()
        .end()
        .findByCssSelector('button').submit()
        .end();
    },

    teardown: function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/')))
        .findByCssSelector('.js-login-link').click()
        .end()
        .clearCookies()
        .end()
        .get(require.toUrl('https://github.com/logout'))
        .findByCssSelector('.auth-form-body input.btn').click()
        .end();
    },

    'Comments form visible when logged in': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .sleep(2000)
        .findByCssSelector('.wc-Comment--form').isDisplayed()
        .then(function (isDisplayed) {
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
        .then(function(text){
          assert.equal('Close Issue', text);
          assert.notEqual('Close and comment', text);
        })
        .end()
        .findByCssSelector('textarea.wc-Comment-text')
        .type('test comment')
        .end()
        .sleep(1000)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text){
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
        .then(function(text){
          assert.equal('Reopen Issue', text);
          assert.notEqual('Reopen and comment', text);
        })
        .end()
        .findByCssSelector('textarea.wc-Comment-text')
        .type('test comment')
        .end()
        .sleep(1000)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text){
          assert.equal('Reopen and comment', text);
          assert.notEqual('Reopen Issue', text);
        });
    },

    'Posting a comment': function() {
      var originalCommentsLength, allCommentsLength;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .findAllByCssSelector('.js-issue-comment:not(.wc-Comment--form)')
        .then(function(elms){
          originalCommentsLength = elms.length;
        })
        .end()
        .findByCssSelector('textarea.wc-Comment-text')
        .type('Today\'s date is ' + new Date().toDateString())
        .end()
        .sleep(2000)
        // click the comment button
        .findByCssSelector('.js-issue-comment-button').click()
        .end()
        .sleep(2000)
        .findAllByCssSelector('.js-issue-comment:not(.wc-Comment--form)')
        .then(function(elms){
          allCommentsLength = elms.length;
          assert(originalCommentsLength < allCommentsLength, 'Comment was successfully left.');
        });
    },

    'Posting an empty comment fails': function() {
      var originalCommentsLength, allCommentsLength;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues/100')))
        .findAllByCssSelector('.js-issue-comment:not(.wc-Comment--form)')
        .then(function(elms){
          originalCommentsLength = elms.length;
        })
        .end()
        // click the comment button
        .findByCssSelector('.js-issue-comment-button').click()
        .end()
        .sleep(500)
        .findAllByCssSelector('.js-issue-comment:not(.wc-Comment--form)')
        .then(function(elms){
          allCommentsLength = elms.length;
          assert(originalCommentsLength === allCommentsLength, 'Comment was not successfully left.');
        });
    }

  });
});
