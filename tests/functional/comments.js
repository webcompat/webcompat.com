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

    'Comments form visible when logged in': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(500)
        .findByCssSelector('.Comment--form').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Comment form visible for logged in users.');
        })
        .end();
    },

    'Comment form not visible for logged out users': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .findByCssSelector('.js-login-link').click()
        .end()
        .findByCssSelector('.Comment--form')
        .then(function () {
          assert.fail('comment form should not be present');
        }, function (err) {
          assert.strictEqual(err.name, 'NoSuchElement');
          return true;
        })
        .end()
        .findByCssSelector('.js-login-link').click()
        .end()
        .sleep(500)
        .findByCssSelector('.Comment--form').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Comment form visible for logged in users.');
        })
        .end();
    },

    'empty vs non-empty comment button text (open issue)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(500)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text){
          assert.equal('Close Issue', text);
          assert.notEqual('Close and comment', text);
        })
        .end()
        .findByCssSelector('textarea.Comment-text')
        .type('test comment')
        .end()
        .sleep(500)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text){
          assert.equal('Close and comment', text);
          assert.notEqual('Close Issue', text);
        });
    },

    'empty vs non-empty comment button text (closed issue)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(101)))
        .sleep(2000)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text){
          assert.equal('Reopen Issue', text);
          assert.notEqual('Reopen and comment', text);
        })
        .end()
        .findByCssSelector('textarea.Comment-text')
        .type('test comment')
        .end()
        .sleep(2000)
        .findByCssSelector('.js-issue-state-button').getVisibleText()
        .then(function(text){
          assert.equal('Reopen and comment', text);
          assert.notEqual('Reopen Issue', text);
        });
    },

    'posting a comment': function() {
      var originalCommentsLength, allCommentsLength;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .findAllByCssSelector('.Comment:not(.Comment--form)')
        .then(function(elms){
          originalCommentsLength = elms.length;
        })
        .end()
        .findByCssSelector('textarea.Comment-text')
        .type('Today\'s date is ' + new Date().toDateString())
        .end()
        .sleep(2000)
        // click the comment button
        .findByCssSelector('.js-issue-comment-button').click()
        .end()
        .sleep(2000)
        .findAllByCssSelector('.Comment:not(.Comment--form)')
        .then(function(elms){
          allCommentsLength = elms.length;
          assert(originalCommentsLength < allCommentsLength, 'Comment was successfully left.');
        });
    },

    'posting an empty comment fails': function() {
      var originalCommentsLength, allCommentsLength;
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .findAllByCssSelector('.Comment:not(.Comment--form)')
        .then(function(elms){
          originalCommentsLength = elms.length;
        })
        .end()
        // click the comment button
        .findByCssSelector('.js-issue-comment-button').click()
        .end()
        .sleep(500)
        .findAllByCssSelector('.Comment:not(.Comment--form)')
        .then(function(elms){
          allCommentsLength = elms.length;
          assert(originalCommentsLength === allCommentsLength, 'Comment was not successfully left.');
        });
    }

  });
});
