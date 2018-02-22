"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function(path) {
  return intern.config.siteRoot + path;
};

registerSuite("Index", {
  tests: {
    "front page loads"() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-hero-title")
        .findByCssSelector(".js-hero-title")
        .getVisibleText()
        .then(function(text) {
          assert.equal(
            text.toLowerCase(),
            "Bug reporting\nfor the web.".toLowerCase()
          );
        })
        .end();
    },

    "reporter addon link is shown"() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-hero-title")
        .findByCssSelector(".js-addon-link")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "Download our");
        })
        .end();
    },

    "form toggles open then closed"() {
      return (
        FunctionalHelpers.openPage(this, url("/"), ".js-hero-title")
          .findByCssSelector("#js-ReportBug")
          .click()
          .end()
          .sleep(1000)
          .findByCssSelector("#js-ReportForm")
          .isDisplayed()
          .then(function(isDisplayed) {
            assert.equal(isDisplayed, true, "The form is displayed");
          })
          .end()
          .execute(function() {
            // scroll up so the driver doesn't get confused and
            // click on the addon link
            window.scrollTo(0, 0);
          })
          .findByCssSelector("#js-ReportBug")
          .click()
          .end()
          // wait a bit for animation to finish
          .sleep(1000)
          .findByCssSelector("#js-ReportForm")
          .isDisplayed()
          .then(function(isDisplayed) {
            assert.equal(isDisplayed, false, "The form should be hidden");
          })
      );
    },

    "browse issues (needstriage)"() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-hero-title")
        .findAllByCssSelector("#js-lastIssue .js-IssueList.label-needstriage")
        .then(function(elms) {
          assert.equal(elms.length, 10, "10 issues should be displayed");
        })
        .end()
        .findByCssSelector(".js-IssueList.label-needstriage .js-issue-number")
        .getVisibleText()
        .then(function(text) {
          assert.match(text, /^Issue\s(\d+)$/, "Issue should have a number");
        })
        .end()
        .findByCssSelector(".js-IssueList.label-needstriage .js-issue-desc a")
        .getAttribute("href")
        .then(function(text) {
          assert.match(text, /^\/issues\/\d+$/, "Link should have a number");
        })
        .end()
        .findByCssSelector(".js-IssueList.label-needstriage .js-issue-desc")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /^Issue\s\d+\n.+/,
            "Issue should have a non-empty title"
          );
        })
        .end()
        .findByCssSelector(".js-IssueList.label-needstriage .js-issue-date")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /^Opened:\s\d{4}\-\d{2}\-\d{2}/,
            "Issue should display creation date"
          );
        })
        .end()
        .findByCssSelector(".js-issue-desc .js-issue-comments")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /Comments:\s\d/,
            "Issue should display number of comments"
          );
        })
        .end();
    }
  }
});
