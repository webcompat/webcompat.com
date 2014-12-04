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
        .findByCssSelector('h2').getVisibleText()
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
        .findAllByCssSelector('button.wc-Filter--untriaged').click()
        .end()
        .findByCssSelector('.IssueList-search-form').getVisibleText()
        .then(function (text) {
          assert.equal(text, '', 'Clicking filter should empty search text');
        })
        .end()
        .findAllByCssSelector('button.wc-Filter--untriaged').click()
        .end()
        .findByCssSelector('.IssueList-search-form').click()
        .type('taco')
        .end()
        .findAllByCssSelector('button.wc-Filter--untriaged').getAttribute('class')
        .then(function (className) {
          assert.notInclude(className, 'is-active', 'Searching should clear all filters');
        })
    }
  });
});
