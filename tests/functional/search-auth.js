"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function(path, params) {
  var fullUrl = params !== undefined
    ? intern.config.siteRoot + path + params
    : intern.config.siteRoot + path;
  return fullUrl;
};

registerSuite("Search (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Search/filter interaction"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-SearchForm-button"
      )
        .findDisplayedByCssSelector(".js-SearchForm-button")
        .click()
        .type("taco")
        .end()
        .findAllByCssSelector(".needsdiagnosis.js-Tag")
        .click()
        .end()
        .findByCssSelector("#js-SearchForm-input")
        .getVisibleText()
        .then(function(text) {
          assert.equal(text, "", "Clicking filter should empty search text");
        })
        .end()
        .findAllByCssSelector(".needsdiagnosis.js-Tag")
        .click()
        .end()
        .findByCssSelector(".js-SearchForm-button")
        .click()
        .type("taco")
        .end()
        .findAllByCssSelector(".needsdiagnosis.js-Tag")
        .getAttribute("class")
        .then(function(className) {
          assert.notInclude(
            className,
            "is-active",
            "Searching should clear all filters"
          );
        })
        .end();
    },

    "Results are loaded from the query params"() {
      var params =
        "?page=1&per_page=50&state=open&stage=all&sort=created&direction=desc&q=vladvlad";
      return FunctionalHelpers.openPage(
        this,
        url("/issues", params),
        ".js-IssueList:nth-of-type(1)"
      )
        .findDisplayedByCssSelector(".js-IssueList:nth-of-type(1) a")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "vladvlad",
            "The search query results show up on the page."
          );
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(
            currUrl,
            "q=vladvlad",
            "Our params didn't go anywhere."
          );
        })
        .end();
    },

    "Search works by icon click"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-IssueList:nth-of-type(10)"
      )
        .findByCssSelector(".js-SearchForm input")
        .type("vladvlad")
        .end()
        .findByCssSelector(".js-SearchForm button")
        .click()
        .end()
        .findDisplayedByCssSelector(".js-IssueList:only-of-type a")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "vladvlad",
            "The search results show up on the page."
          );
        })
        .end();
    },

    "Search works by Return key"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        ".js-SearchForm input"
      )
        .findDisplayedByCssSelector(".js-SearchForm input")
        .type("vladvlad")
        .type("\uE007")
        .end()
        .findDisplayedByCssSelector(".js-IssueList:only-of-type a")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "vladvlad",
            "The search results show up on the page."
          );
        })
        .end();
    },

    "Search from the homepage"() {
      return (
        FunctionalHelpers.openPage(this, url("/"), ".js-SearchBarOpen")
          .get(url("/"))
          .findByCssSelector(".js-SearchBarOpen")
          .click()
          .end()
          // Wait for animation to complete.
          .sleep(1000)
          .findByCssSelector(".js-SearchBar input")
          .click()
          .type("vladvlad")
          .type("\uE007")
          .end()
          .findDisplayedByCssSelector(".js-IssueList:only-of-type a")
          .getVisibleText()
          .then(function(text) {
            assert.include(
              text,
              "vladvlad",
              "The search query results show up on the page."
            );
          })
          .end()
          .getCurrentUrl()
          .then(function(currUrl) {
            assert.include(currUrl, "page=1", "Default params got merged.");
          })
          .end()
      );
    },

    "Search with a dash works"() {
      // load up a garbage search, so we can more easily detect when
      // the search values we want are loaded.
      var searchParam = "?q=jfdkjfkdjfkdjfdkjfkd";
      return FunctionalHelpers.openPage(
        this,
        url("/issues", searchParam),
        ".js-no-results"
      )
        .findByCssSelector("#js-SearchForm-input")
        .clearValue()
        .click()
        .type("label:status-tacos")
        .type("\uE007")
        .end()
        .findDisplayedByCssSelector(
          ".js-IssueList:first-of-type .js-Issue-label"
        )
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "tacos",
            "The label:status-tacos search worked."
          );
        })
        .end();
    },

    "Search input is loaded from q param (with dashes)"() {
      // load up a garbage search, so we can more easily detect when
      // the search values we want are loaded.
      var searchParam = "?q=one:two-three";
      return FunctionalHelpers.openPage(
        this,
        url("/issues", searchParam),
        ".js-no-results"
      )
        .findByCssSelector("#js-SearchForm-input")
        .getProperty("value")
        .then(function(text) {
          assert.include(
            text,
            "one:two-three",
            "The q param populated the search input."
          );
        })
        .end();
    }
  }
});
