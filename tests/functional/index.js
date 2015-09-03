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
        .findByCssSelector('.wc-Hero-title').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Bug reporting\nfor the internet.');
        })
        .end();
    },

    'my issues (when logged in)': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url))
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
        .end()
        .findByCssSelector('.js-login-link').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Logout');
        })
        .end()
        .findByCssSelector('#my-issues h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Submitted by Me');
        })
        .sleep(1000)
        .end();
    },

    'reporter addon link is shown': function () {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('.wc-Navbar-link').getVisibleText()
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
        .findByCssSelector('.form-opened').isDisplayed()
        .then(function (isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        .findByCssSelector('#report-bug.is-open').click()
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
        .findAllByCssSelector('#needs-diagnosis .wc-IssueItem.wc-IssueItem--needsDiagnosis')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--needsDiagnosis .wc-IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--needsDiagnosis .wc-IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--needsDiagnosis .wc-IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--needsDiagnosis .wc-IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    },

    'browse issues (new)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#new h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'New Issues');
        })
        .end()
        .findAllByCssSelector('#new .wc-IssueItem.wc-IssueItem--new')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--new .wc-IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    },

    'browse issues (site contacted)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#sitewait h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Site Contacted');
        })
        .end()
        .findAllByCssSelector('#sitewait .wc-IssueItem.wc-IssueItem--sitewait')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--sitewait .wc-IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--sitewait .wc-IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--sitewait .wc-IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--sitewait .wc-IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    },

    'browse issues (ready for outreach)': function() {
      return this.remote
        .get(require.toUrl(url))
        .findByCssSelector('#ready-for-outreach h3').getVisibleText()
        .then(function (text) {
          assert.equal(text, 'Ready for Outreach');
        })
        .end()
        .findAllByCssSelector('#ready-for-outreach .wc-IssueItem.wc-IssueItem--ready')
        .then(function (elms) {
          assert.equal(elms.length, 4, '4 issues should be displayed');
        })
        .end()
        .end()
        .findByCssSelector('.wc-IssueItem--ready .wc-IssueItem-count').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s(\d+)$/, 'Issue should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--ready .wc-IssueItem-header a').getAttribute('href')
        .then(function (text) {
          assert.match(text, /^\/issues\/\d+$/, 'Link should have a number');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--ready .wc-IssueItem-header').getVisibleText()
        .then(function (text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, 'Issue should have a non-empty title');
        })
        .end()
        .findByCssSelector('.wc-IssueItem--ready .wc-IssueItem-metadata').getVisibleText()
        .then(function (text) {
          assert.match(text, /comments:\s\d+$/, 'Issue should display number of comments');
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}.+/, 'Issue should display creation date');
        })
        .end();
    }

  });
});
