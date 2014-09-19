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
    name: 'reporting anonymously',

    'submit buttons are disabled': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + "?open=1"))
        .findByCssSelector('#submitanon').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-disabled');
        })
        .end()
        .findByCssSelector('#submitgithub').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-disabled');
        })
    },

    'validation works': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + "?open=1"))
        .findByCssSelector('#url').click()
        .end()
        .findByCssSelector('#summary').click()
        .end()
        // test fails unless we sleep for a bit :|
        .sleep(1000)
        .findByCssSelector('.Report-form > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'has-error');
        })
        .end()
        .findByCssSelector('#url').type('hi')
        .end()
        .findByCssSelector('#summary').click()
        .end()
        .findByCssSelector('.u-formGroup').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'no-error');
          assert.notInclude(className, 'has-error');
        })
        .end()
        .findByCssSelector('#summary').type('sup')
        .end()
        // xpath to the #summary formGroup
        .findByXpath('//*[@id="new-report"]/div/form/div[1]/div[2]/div').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'no-error');
          assert.notInclude(className, 'has-error');
        })
        .end()
        // now make sure the buttons aren't disabled anymore
        .findByCssSelector('#submitanon').getAttribute('class')
        .then(function (className) {
          assert.notInclude(className, 'is-disabled');
        })
        .end()
        .findByCssSelector('#submitgithub').getAttribute('class')
        .then(function (className) {
          assert.notInclude(className, 'is-disabled');
        })
    },

    'anonymous report': function () {
      var issueNumber;

      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + "?open=1"))
        .findByCssSelector('#url').type('some broken URL')
        .end()
        .findByCssSelector('#summary').type('this site doesnt work ' + Math.random())
        .end()
        .findByCssSelector('#submitanon').click()
        .end()
        .findByCssSelector('.wc-content--body h2').getVisibleText()
        .then(function (text) {
          // Make sure we got to the /thanks/<number> route
          assert.equal(text, 'Thank you.');
        })
        .end()
        .findByCssSelector('.wc-content--body a').getVisibleText()
        .then(function (text) {
          // Grab the issue number from the end of the URL link
          issueNumber = text.split('/').pop();
        })
        .end()
        .findByCssSelector('.wc-content--body a').getVisibleText().click()
        .end()
        .findByCssSelector('.js-issue-title').getVisibleText()
        .then(function (text) {
          // Make sure GitHub has the correct title
          assert.include(text, 'some broken URL - this site doesnt work');
        })
        .end()
        .findByCssSelector('.gh-header-number').getVisibleText()
        .then(function (text) {
          // Make sure GitHub has the correct issue number
          assert.equal(text, '#' + issueNumber);
        })
    }

  });
});
