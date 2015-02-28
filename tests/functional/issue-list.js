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

  var url = intern.config.siteRoot + '/issues';

  registerSuite({
    name: 'issue-list',

    'FilterView renders': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('.js-issuelist-filter .Dropdown--large .Dropdown-label').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Issues', 'Page header displayed');
        })
        .end()
        .findAllByCssSelector('button.wc-Filter')
        .then(function (elms) {
          assert.equal(elms.length, 5, 'All filter buttons are displayed');
        })
        .end();
    },

    'loading image is shown when requesting issues': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        // click next page to trigger loader image
        .findByCssSelector('.js-pagination-next').click()
        .end()
        .findByCssSelector('.js-loader').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'Loading image is visible.');
        })
        .end()
        // give it some time to go away
        .sleep(2500)
        .findByCssSelector('.js-loader').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, false, 'Loading image is hidden.');
        })
        .end();
    },

    'IssueListView renders': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('.js-issue-list').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList container is visible.');
        })
        .sleep(1000)
        .end()
        .findByCssSelector('.js-issue-list .IssueItem').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList item is visible.');
        })
        .end()
        .findByCssSelector('.IssueItem .IssueItem-header').getVisibleText()
        .then(function(text){
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.IssueItem:nth-child(1) > div:nth-child(1) > p:nth-child(2)').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/i, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    },

    'PaginationControlsView tests': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('.js-pagination-controls').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList container is visible.');
        })
        .end()
        .findByCssSelector('.js-pagination-previous.is-disabled').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-disabled', 'First page load should have disabled prev button');
        })
        .end()
        .findByCssSelector('.js-pagination-next').click()
        .end()
        .findByCssSelector('.js-pagination-previous:not(.is-disabled)').getAttribute('class')
        .then(function (className) {
          assert.notInclude(className, 'is-disabled', 'Clicking next enables prev button');
        })
        .end()
        .findByCssSelector('.js-pagination-previous').click()
        .end()
        .findByCssSelector('.js-pagination-previous.is-disabled').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-disabled', 'Going back from first next click should have disabled prev button');
        })
        .end();
    },

    'pagination dropdown tests': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('.js-dropdown-pagination').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'pagination dropdown container is visible.');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle').click()
        .end()
        .findByCssSelector('.js-dropdown-pagination').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-active', 'clicking dropdown adds is-active class');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-options').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'dropdown options are visible.');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination li.Dropdown-item:nth-child(3) > a:nth-child(1)').click()
        .end()
        .findByCssSelector('.js-dropdown-pagination .Dropdown-label').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Show 100', 'Clicking first option updated dropdown label');
        })
        .end()
        .findByCssSelector('.IssueItem:nth-child(51)').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'More than 50 issues were loaded.');
        })
        .end();
    },

    'search/filter interaction': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('.IssueList-search-form').click()
        .type('taco')
        .end()
        .findAllByCssSelector('button.wc-Filter--new').click()
        .end()
        .findByCssSelector('.IssueList-search-form').getVisibleText()
        .then(function (text) {
          assert.equal(text, '', 'Clicking filter should empty search text');
        })
        .end()
        .findAllByCssSelector('button.wc-Filter--new').click()
        .end()
        .findByCssSelector('.IssueList-search-form').click()
        .type('taco')
        .end()
        .findAllByCssSelector('button.wc-Filter--new').getAttribute('class')
        .then(function (className) {
          assert.notInclude(className, 'is-active', 'Searching should clear all filters');
        });
    },

    'pressing g goes to github issues': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('body').click()
        .type('g')
        .end()
        // look for the issues container on github.com/foo/bar/issues
        .findByCssSelector('.repo-container .issues-listing').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true, 'We\'re at GitHub now.');
        })
        .end();
    },

    'loading issues page has default params in URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        // find something so we know the page has loaded
        .findByCssSelector('.IssueItem:nth-of-type(1)')
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'page=1&per_page=50&state=open', 'Default model params are added to the URL');
        });
    },

    'loading partial params results in merge with defaults': function() {
        var params = '?page=2';
        return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url + params))
          // find something so we know the page has loaded
          .findByCssSelector('.IssueItem:nth-of-type(1)')
          .getCurrentUrl()
          .then(function(currUrl){
            assert.include(currUrl, 'page=2&per_page=50&state=open', 'Default model params are merged with partial URL params');
          });
    },

    'dropdowns reflect state from URL': function() {
      var params = '?per_page=25&sort=updated&direction=desc&state=all';

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + params))
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle h1').getVisibleText()
        .then(function(text){
          assert.equal(text, 'Show 25', 'Pagination dropdown label is updated from URL params');
        })
        .end()
        .findAllByCssSelector('.js-issuelist-filter .js-dropdown-toggle h1').getVisibleText()
        .then(function(text){
          assert.equal(text, 'View all Issues', 'Filter dropdown label is updated from URL params');
        })
        .end()
        .findAllByCssSelector('.js-dropdown-sort .js-dropdown-toggle h1').getVisibleText()
        .then(function(text){
          assert.equal(text, 'Recently Updated', 'Sort dropdown label is updated from URL params');
        })
        .end();
    },

    'going back in history updates issue list and URL state': function() {
      var params = '?per_page=25';

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + params))
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle h1').getVisibleText()
        .then(function(text){
          assert.equal(text, 'Show 25', 'Pagination dropdown label is updated from URL params');
        })
        .end()
        // Select "Show 100" from pagination dropdown
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle').click()
        .end()
        .findByCssSelector('.js-dropdown-pagination li.Dropdown-item:nth-child(3) > a:nth-child(1)').click()
        .end()
        // find something so we know issues have been loaded
        .findByCssSelector('.IssueItem:nth-of-type(1)')
        .goBack()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'per_page=25', 'URL param is back to where we started');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle h1').getVisibleText()
        .then(function(text){
          assert.equal(text, 'Show 25', 'Pagination dropdown label is back to where we started');
        })
        .end();
    },

    'clicking on a stage filter adds the correct param to the URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('[data-filter="contactready"]').click()
        .end()
        // find something so we know the page has loaded
        .findByCssSelector('.IssueItem:nth-of-type(1)')
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'stage=contactready', 'Stage filter added to URL correctly.');
        })
        .end();
    },

    'toggling a stage filter doesn\'t leave the param in the URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('[data-filter="closed"]').click()
        .end()
        // find something so we know the page has loaded
        .findByCssSelector('.IssueItem:nth-of-type(1)')
        .end()
        .findByCssSelector('[data-filter="closed"]').click()
        .end()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.notInclude(currUrl, 'stage=closed', 'Stage filter added then removed from URL.');
        })
        .end();
    },

    'toggling between stage filters results in last param in URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('[data-filter="closed"]').click()
        .end()
        // find something so we know the page has loaded
        .findByCssSelector('.IssueItem:nth-of-type(1)')
        .end()
        .findByCssSelector('[data-filter="sitewait"]').click()
        .end()
        .getCurrentUrl()
        .then(function(currUrl){
          assert.include(currUrl, 'stage=sitewait', 'Stage filter added to URL correctly.');
          assert.notInclude(currUrl, 'stage=closed', 'Stage removed from URL correctly.');
        })
        .end();
    }

    // 'clicking on a label performs a label search': function() {
    //   return this.remote
    //     .setFindTimeout(intern.config.wc.pageLoadTimeout)
    //     .get(require.toUrl(url))
    //     // click on the sort dropdown
    //     .findByCssSelector('div.Dropdown:nth-child(2) > button:nth-child(1)').click()
    //     .end()
    //     // select "Oldest", because we know Issue #1 has the "there-can-only-be-one" label
    //     .findByCssSelector('div.Dropdown:nth-child(2) > ul:nth-child(2) > li:nth-child(2) > a:nth-child(1)').click()
    //     .end()
    //     .findByCssSelector('[href$="there-can-only-be-one"]').click()
    //     .end()
    //     .findByCssSelector('.js-issue-list .IssueItem:first-of-type .js-issue-label').getVisibleText()
    //     .then(function (text) {
    //       assert.include(text, 'there-can-only-be-one', 'The shown issue has the right label.');
    //     });
    // }
  });
});
