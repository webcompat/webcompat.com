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

  var url = intern.config.siteRoot;

  registerSuite({
    name: 'index',

    'front page loads': function () {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#maintitle h1').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bug reporting\nfor the internet.');
        })
        .end();
    },

    'my issues (when logged in)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('.nav__section--right .nav__link').click()
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
        .end()
        .findByCssSelector('.nav__section--right .nav__link').getVisibleText()
        .then(function (text) {
          assert.equal(text, "Logout");
        })
        .end()
        .findByCssSelector('#my-issues h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Submitted by Me');
        })
        .sleep(1000)
        .end()
    },

    'reporter addon link is shown': function () {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('.nav__link').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Download our Firefox');
        })
        .end();
    },

    'form toggles open then closed': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
        .findByCssSelector('#report-bug.closed').click()
        .end()
        .findByCssSelector('.form-opened')
        .end()
        .findByCssSelector('#report-bug.opened').click()
        .end()
        .findByCssSelector('.form-closed').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, false);
        });
    },

    'browse issues (needs diagnosis)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#needs-diagnosis h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Needs Diagnosis');
        })
        .end()
        .findAllByCssSelector('.IssueItem.IssueItem--need')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .findByCssSelector('.IssueItem--need .IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--need .IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--need .IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.IssueItem--need .IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end()
    },

    'browse issues (untriaged)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#untriaged h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Untriaged Issues');
        })
        .end()
        .findAllByCssSelector('.IssueItem.IssueItem--untriaged')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .findByCssSelector('.IssueItem--untriaged .IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--untriaged .IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--untriaged .IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.IssueItem--untriaged .IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end()
    },

    'browse issues (site contacted)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#sitewait h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Site Contacted');
        })
        .end()
        .findAllByCssSelector('.IssueItem.IssueItem--sitewait')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .findByCssSelector('.IssueItem--sitewait .IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--sitewait .IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--sitewait .IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.IssueItem--sitewait .IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end()
    },

    'browse issues (ready for outreach)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#ready-for-outreach h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Ready for Outreach');
        })
        .end()
        .findAllByCssSelector('.IssueItem.IssueItem--ready')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .end()
        .findByCssSelector('.IssueItem--ready .IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--ready .IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.IssueItem--ready .IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.IssueItem--ready .IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end()
    }

  });
});
