/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  "intern",
  "intern!object",
  "intern/chai!assert",
  "require",
  "tests/functional/lib/helpers",
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  "use strict";

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: "Index",

    "front page loads": function() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-Hero-title")
        .findByCssSelector(".js-Hero-title").getVisibleText()
        .then(function(text) {
          assert.equal(text, "Bug reporting\nfor the internet.");
        })
        .end();
    },

    "copyURL works": function() {
      return FunctionalHelpers.openPage(this, url("/?open=1"), "#url")
        .findDisplayedByCssSelector("#url")
        .type("zombo.com")
        .end()
        .findByCssSelector("#description").getProperty("value")
        .then(function(value) {
          assert.include(value, "zombo");
        })
        .end();
    },

    "reporter addon link is shown": function() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-Hero-title")
        .findByCssSelector(".js-Navbar-link").getVisibleText()
        .then(function(text) {
          assert.include(text, "Download our");
        })
        .end();
    },

    "form toggles open then closed": function() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-Hero-title")
        .findByCssSelector("#js-ReportBug").click()
        .end()
        .findDisplayedByCssSelector("#js-ReportForm")
        .end()
        .findByCssSelector("#js-ReportBug").click()
        .end()
        // wait a bit for animation to finish
        .sleep(1000)
        .findByCssSelector("#js-ReportForm").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, false, "The form should be hidden");
        });
    },

    "browse issues (needstriage)": function() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-Hero-title")
        .findAllByCssSelector("#js-lastIssue .js-IssueList.wc-IssueList--needstriage")
        .then(function(elms) {
          assert.equal(elms.length, 10, "10 issues should be displayed");
        })
        .end()
        .findByCssSelector(".wc-IssueList--needstriage .wc-IssueList-count").getVisibleText()
        .then(function(text) {
          assert.match(text, /^Issue\s(\d+)$/, "Issue should have a number");
        })
        .end()
        .findByCssSelector(".wc-IssueList--needstriage .wc-IssueList-header a").getAttribute("href")
        .then(function(text) {
          assert.match(text, /^\/issues\/\d+$/, "Link should have a number");
        })
        .end()
        .findByCssSelector(".wc-IssueList--needstriage .wc-IssueList-header").getVisibleText()
        .then(function(text) {
          assert.match(text, /^Issue\s\d+:\s.+$/, "Issue should have a non-empty title");
        })
        .end()
        .findByCssSelector(".wc-IssueList--needstriage .wc-IssueList-metadata:nth-child(1)").getVisibleText()
        .then(function(text) {
          assert.match(text, /^Opened:\s\d{4}\-\d{2}\-\d{2}/, "Issue should display creation date");
        })
        .end()
        .findByCssSelector(".wc-IssueList--needstriage .wc-IssueList-metadata:nth-child(2)").getVisibleText()
        .then(function(text) {
          assert.match(text, /Comments:\s\d/, "Issue should display number of comments");
        })
        .end();
    }
  });
});
