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
    name: 'reporting',

    'submit buttons are disabled': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        .findByCssSelector('#submitanon').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-disabled');
        })
        .end()
        .findByCssSelector('#submitgithub').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'is-disabled');
        });
    },

    'wyciwyg bug workaround': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1&url=wyciwyg://0/http://bbs.csdn.net/topics/20282413'))
        .findByCssSelector('#url').getProperty('value')
        .then(function (value) {
          assert.notInclude(value, 'wyciwyg://0/');
        })
        .end();
    },

    'report button shows name when logged in': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // wait a second
        .sleep(1000)
        .findByCssSelector('#submitgithub').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Report as'); //Report as FooUser (logged in)
        })
        .end()
        // log out
        .findByCssSelector('.js-login-link').click()
        .end()
        // wait a second
        .sleep(1000)
        .findByCssSelector('#submitgithub').getVisibleText()
        .then(function (text) {
          assert.include(text, 'Report via'); //Report via GitHub (logged out)
        })
        .end();
    },

    'validation works': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        .findByCssSelector('#url').click()
        .end()
        .findByCssSelector('#browser').click()
        .end()
        .findByCssSelector('#url').click()
        .end()
        // wait a second
        .sleep(1000)
        .findByXpath('//*[@id="new-report"]/div/form/div[1]/div[2]/div[1]').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'js-form-error');
          assert.notInclude(className, 'js-no-error');
        })
        .end()
        .findByCssSelector('#url').type('sup')
        .end()
        // wait a second
        .sleep(1000)
        // xpath to the #url formGroup
        .findByXpath('//*[@id="new-report"]/div/form/div[1]/div[2]/div[1]').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'js-no-error');
          assert.notInclude(className, 'js-form-error');
        })
        .end()
        // click in the textarea to trigger validation for radios
        .findByCssSelector('#description').click()
        .end()
        // wait a second
        .sleep(1000)
        .findByXpath('//*[@id="new-report"]/div/form/div[1]/div[1]/fieldset').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'js-form-error');
          assert.notInclude(className, 'js-no-error');
        })
        .end()
        // pick a problem type
        .findByCssSelector('#problem_category-0').click()
        .end()
        // wait a second
        .sleep(1000)
        // validation message should be removed now
        .findByXpath('//*[@id="new-report"]/div/form/div[1]/div[1]/fieldset').getAttribute('class')
        .then(function (className) {
          assert.include(className, 'js-no-error');
          assert.notInclude(className, 'js-form-error');
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
        });
    },

    // 'anonymous report': function () {
    //   var issueNumber;

    //   return this.remote
    //     .setFindTimeout(intern.config.wc.pageLoadTimeout)
    //     .get(require.toUrl(url + "?open=1"))
    //     .findByCssSelector('#url').type('some broken URL')
    //     .end()
    //     .findByCssSelector('#summary').type('this site doesnt work ' + Math.random())
    //     .end()
    //     .findByCssSelector('#submitanon').click()
    //     .end()
    //     .findByCssSelector('.wc-content--body h2').getVisibleText()
    //     .then(function (text) {
    //       // Make sure we got to the /thanks/<number> route
    //       assert.equal(text, 'Thank you.');
    //     })
    //     .end()
    //     .findByCssSelector('.wc-content--body a').getVisibleText()
    //     .then(function (text) {
    //       // Grab the issue number from the end of the URL link
    //       issueNumber = text.split('/').pop();
    //     })
    //     .end()
    //     .findByCssSelector('.wc-content--body a').getVisibleText().click()
    //     .end()
    //     .findByCssSelector('.js-issue-title').getVisibleText()
    //     .then(function (text) {
    //       // Make sure GitHub has the correct title
    //       assert.include(text, 'some broken URL - this site doesnt work');
    //     })
    //     .end()
    //     .findByCssSelector('.gh-header-number').getVisibleText()
    //     .then(function (text) {
    //       // Make sure GitHub has the correct issue number
    //       assert.equal(text, '#' + issueNumber);
    //     })
    // }

  });
});
