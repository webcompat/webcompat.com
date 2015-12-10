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
    name: 'Issue-list',

    'FilterView renders': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('.js-issuelist-filter .wc-Dropdown--large .wc-Dropdown-label').getVisibleText()
        .then(function(text) {
          assert.include(text, 'Issues', 'Page header displayed');
        })
        .end()
        .findAllByCssSelector('button.wc-Filter')
        .then(function(elms) {
          assert.equal(elms.length, 6, 'All filter buttons are displayed');
        })
        .end();
    },

    'IssueListView renders': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('.js-issue-list').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList container is visible.');
        })
        .sleep(1000)
        .end()
        .findByCssSelector('.js-issue-list .wc-IssueItem').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList item is visible.');
        })
        .end()
        .findByCssSelector('.wc-IssueItem .wc-IssueItem-header').getVisibleText()
        .then(function(text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem:nth-child(1) > div:nth-child(1) > p:nth-child(2)').getVisibleText()
        .then(function(text) {
          assert.match(text, /comments:\s\d+$/i, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    },

    'PaginationControlsView tests': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('.js-pagination-controls').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'IssueList container is visible.');
        })
        .end()
        .findByCssSelector('.js-pagination-previous.is-disabled').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'is-disabled', 'First page load should have disabled prev button');
        })
        .end()
        .findByCssSelector('.js-pagination-next').click()
        .end()
        .findByCssSelector('.js-pagination-previous:not(.is-disabled)').getAttribute('class')
        .then(function(className) {
          assert.notInclude(className, 'is-disabled', 'Clicking next enables prev button');
        })
        .end()
        .findByCssSelector('.js-pagination-previous').click()
        .end()
        .findByCssSelector('.js-pagination-previous.is-disabled').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'is-disabled', 'Going back from first next click should have disabled prev button');
        })
        .end();
    },

    'Pagination dropdown tests': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('.js-dropdown-pagination').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'pagination dropdown container is visible.');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle').click()
        .end()
        .findByCssSelector('.js-dropdown-pagination').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'is-active', 'clicking dropdown adds is-active class');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-options').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'dropdown options are visible.');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination li.wc-Dropdown-item:nth-child(3) > a:nth-child(1)').click()
        .end()
        .findByCssSelector('.js-dropdown-pagination .wc-Dropdown-label').getVisibleText()
        .then(function(text) {
          assert.include(text, 'Show 100', 'Clicking first option updated dropdown label');
        })
        .end()
        .findByCssSelector('.wc-IssueItem:nth-child(51)').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'More than 50 issues were loaded.');
        })
        .end();
    },

    'Pressing g goes to github issues': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('body').click()
        .type('g')
        .end()
        // look for the issues container on github.com/foo/bar/issues
        .findByCssSelector('.issues-listing').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'We\'re at GitHub now.');
        })
        .end();
    },

    'Pressing g inside of search input *doesn\'t* go to github issues': function() {
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

    'Loading issues page has default params in URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        // find something so we know the page has loaded
        .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, 'page=1&per_page=50&state=open', 'Default model params are added to the URL');
        });
    },

    'Loading partial params results in merge with defaults': function() {
      var params = '?page=2';
      return this.remote
          .setFindTimeout(intern.config.wc.pageLoadTimeout)
          .get(require.toUrl(url('/issues') + params))
          // find something so we know the page has loaded
          .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
          .getCurrentUrl()
          .then(function(currUrl) {
            assert.include(currUrl, 'page=2&per_page=50&state=open', 'Default model params are merged with partial URL params');
          });
    },

    'Dropdowns reflect state from URL': function() {
      var params = '?per_page=25&sort=updated&direction=desc&state=all';

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle h1').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Show 25', 'Pagination dropdown label is updated from URL params');
        })
        .end()
        .findAllByCssSelector('.js-issuelist-filter .js-dropdown-toggle h1').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'View all Issues', 'Filter dropdown label is updated from URL params');
        })
        .end()
        .findAllByCssSelector('.js-dropdown-sort .js-dropdown-toggle h1').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Recently Updated', 'Sort dropdown label is updated from URL params');
        })
        .end();
    },

    'Going back in history updates issue list and URL state': function() {
      var params = '?per_page=25';

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle h1').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Show 25', 'Pagination dropdown label is updated from URL params');
        })
        .end()
        // Select "Show 100" from pagination dropdown
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle').click()
        .end()
        .findByCssSelector('.js-dropdown-pagination li.wc-Dropdown-item:nth-child(3) > a:nth-child(1)').click()
        .end()
        // find something so we know issues have been loaded
        .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
        .goBack()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, 'per_page=25', 'URL param is back to where we started');
        })
        .end()
        .findByCssSelector('.js-dropdown-pagination .js-dropdown-toggle h1').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Show 25', 'Pagination dropdown label is back to where we started');
        })
        .end();
    },

    'Loading URL with stage param loads issues': function() {
      var params = '?page=1&per_page=50&state=open&stage=new&sort=created&direction=desc';

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        // Did an issue load?
        .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
        .end()
        .findByCssSelector('.js-filter-button.is-active').getVisibleText()
        .then(function(text) {
          assert.equal('New Issues', text, 'New Issues filter is selected.');
        })
        .end();
    },

    'Clicking on a stage filter adds the correct param to the URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('[data-filter="contactready"]').click()
        .end()
        // find something so we know the page has loaded
        .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, 'stage=contactready', 'Stage filter added to URL correctly.');
        })
        .end();
    },

    'Toggling a stage filter doesn\'t leave the param in the URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('[data-filter="closed"]').click()
        .end()
        // find something so we know the page has loaded
        .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
        .end()
        .findByCssSelector('[data-filter="closed"]').click()
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.notInclude(currUrl, 'stage=closed', 'Stage filter added then removed from URL.');
        })
        .end();
    },

    'Toggling between stage filters results in last param in URL': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues')))
        .findByCssSelector('[data-filter="closed"]').click()
        .end()
        // find something so we know the page has loaded
        .findByCssSelector('.wc-IssueItem:nth-of-type(1)')
        .end()
        .findByCssSelector('[data-filter="sitewait"]').click()
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, 'stage=sitewait', 'Stage filter added to URL correctly.');
          assert.notInclude(currUrl, 'stage=closed', 'Stage removed from URL correctly.');
        })
        .end();
    },

    'Results are loaded from the query params': function() {
      var params = '?q=vladvlad';
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url('/issues') + params))
        .findByCssSelector('.wc-IssueItem:nth-of-type(1) a').getVisibleText()
        .then(function(text) {
          assert.include(text, 'vladvlad', 'The search query results show up on the page.');
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, 'q=vladvlad', 'Our params didn\'t go anywhere.');
        })
        .end();
    }

  });
});
