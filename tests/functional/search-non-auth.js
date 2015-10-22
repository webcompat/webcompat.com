/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/dojo/node!leadfoot/keys'
], function (intern, registerSuite, assert, require, keys) {
  'use strict';

  var url = function (path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'Search (non-auth)',

    'Pressing g inside of search input *doesnt* go to github issues': function() {
      return this.remote
        // set a short timeout, so we don't have to wait 10 seconds
        // to realize we're not at GitHub.
        .setFindTimeout(50)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('#IssueList-search-input').click()
        .type('g')
        .end()
        .findByCssSelector('.repo-container .issues-listing')
        .then(assert.fail, function(err) {
           assert.isTrue(/NoSuchElement/.test(String(err)));
        })
        .end();
    },

    'Clicking on label search suggestion works': function() {
      var params = '?q=dfjdkfjdkfjkdfjdkjf';
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        .findByCssSelector('.IssueList-noResults-list-labelsItem:nth-child(1) > a:nth-child(1)').click()
        .end()
        // click the first suggestion, which is "android"
        .findByCssSelector('.wc-IssueItem:nth-child(1) > div:nth-child(2) > span:nth-child(1) > a:nth-child(1)').getVisibleText()
        .then(function(text){
          assert.include(text, 'android', 'Clicking on a suggested label gets you results.');
        })
        .end();
    },

    'Results are loaded from the query params': function() {
      var params = '?q=vladvlad';
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        .findByCssSelector('.wc-IssueItem:nth-of-type(1) a').getVisibleText()
        .then(function(text){
          assert.include(text, 'vladvlad', 'The search query results show up on the page.');
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'q=vladvlad', 'Our params didn\'t go anywhere.');
        })
        .end();
    },

    'Search input is visible': function() {
      return this.remote
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('.js-issuelist-search').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Search input is visible for non-authed users.');
        })
        .end();
    },

    'Search works': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('.js-issuelist-search input')
        .type('vladvlad')
        .end()
        .findByCssSelector('.js-issuelist-search button').click()
        .end()
        // this is lame, but we gotta wait on search results.
        .sleep(3000)
        .findByCssSelector('.wc-IssueItem:nth-of-type(1) a').getVisibleText()
        .then(function(text){
          assert.include(text, 'vladvlad', 'The search results show up on the page.');
        })
        .end();
    },

    'Search from the homepage': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/')))
        .findByCssSelector('.js-SearchBarOpen').click()
        .end()
        .findByCssSelector('.js-SearchBar input').click()
        .type('vladvlad')
        .type(keys.ENTER)
        .end()
        .sleep(3000)
        .findByCssSelector('.wc-IssueItem:nth-of-type(1) a').getVisibleText()
        .then(function(text){
          assert.include(text, 'vladvlad', 'The search query results show up on the page.');
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'page=1', 'Default params got merged.');
        })
        .end();
      }
  });
});
