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

registerSuite("User Activity (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "We're at the right place"() {
      var username;
      return FunctionalHelpers.openPage(this, url("/me"), ".js-username")
        .findByCssSelector(".js-username")
        .getVisibleText()
        .then(function(text) {
          var match = text.match(/Issues reported by (.+)/);
          if (match) {
            username = match[1];
          }
        })
        .getCurrentUrl()
        .then(function(currURL) {
          assert.include(
            currURL,
            username,
            "The redirected URL has our username in it."
          );
        })
        .end();
    },

    "IssueListView renders"() {
      return FunctionalHelpers.openPage(
        this,
        url("/activity/testuser"),
        ".js-IssueList"
      )
        .findByCssSelector(".js-IssueList")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList container is visible.");
        })
        .sleep(1000)
        .end()
        .findByCssSelector(".js-list-issue .js-IssueList")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "IssueList item is visible.");
        })
        .end()
        .findByCssSelector(".js-IssueList .js-issue-title")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(
            isDisplayed,
            true,
            "IssueList item is has non-empty title."
          );
        })
        .end()
        .findByCssSelector(".js-issue-comments")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /comments:\s\d+$/i,
            "Issue should display number of comments"
          );
        })
        .end()
        .findByCssSelector(".js-issue-date")
        .getVisibleText()
        .then(function(text) {
          assert.match(
            text,
            /^Opened:\s\d{4}-\d{2}-\d{2}/,
            "Issue should display creation date"
          );
        })
        .end();
    },

    "needsinfo section renders"() {
      return FunctionalHelpers.openPage(
        this,
        url("/activity/testuser"),
        ".js-IssueList"
      )
        .findByCssSelector("#needsinfo-issues")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(
            isDisplayed,
            true,
            "needsinfo IssueList container is visible"
          );
        })
        .sleep(1000)
        .end()
        .findByCssSelector(".label-status-needsinfo-testuser")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "A needsinfo label is visible");
        })
        .end();
    },

    "Trying to view someone else's activity fails (logged in)"() {
      return FunctionalHelpers.openPage(
        this,
        url("/activity/someoneelse"),
        "article"
      )
        .findByCssSelector("article .headline-1")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "Forbidden",
            "Get a 403 when trying to view someone else's activity"
          );
        })
        .end();
    }
  }
});
