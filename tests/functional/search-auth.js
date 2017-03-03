/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  "intern",
  "intern!object",
  "intern/chai!assert",
  "require",
  "tests/functional/lib/helpers",
  "intern/dojo/node!leadfoot/keys"
], function(intern, registerSuite, assert, require, FunctionalHelpers, keys) {
  "use strict";

  var url = function(path, params) {
    var fullUrl = params !== undefined ? intern.config.siteRoot + path + params :
                                         intern.config.siteRoot + path;
    return fullUrl;
  };

  registerSuite({
    name: "Search (auth)",

    setup: function() {
      return FunctionalHelpers.login(this);
    },

    teardown: function() {
      return FunctionalHelpers.logout(this);
    },

    "Search/filter interaction": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), ".wc-SearchForm-item")
        .findDisplayedByCssSelector(".wc-SearchForm-item").click()
        .type("taco")
        .end()
        .findAllByCssSelector("button.wc-Tag--needstriage").click()
        .end()
        .findByCssSelector(".wc-SearchForm-item").getVisibleText()
        .then(function(text) {
          assert.equal(text, "", "Clicking filter should empty search text");
        })
        .end()
        .findAllByCssSelector("button.wc-Tag--needstriage").click()
        .end()
        .findByCssSelector(".wc-SearchForm-item").click()
        .type("taco")
        .end()
        .findAllByCssSelector("button.wc-Tag--needstriage").getAttribute("class")
        .then(function(className) {
          assert.notInclude(className, "is-active", "Searching should clear all filters");
        })
        .end();
    },

    "Results are loaded from the query params": function() {
      var params = "?page=1&per_page=50&state=open&stage=all&sort=created&direction=desc&q=vladvlad";
      return FunctionalHelpers.openPage(this, url("/issues", params), ".wc-IssueList:nth-of-type(1)")
        .findDisplayedByCssSelector(".wc-IssueList:nth-of-type(1) .wc-Link").getVisibleText()
        .then(function(text) {
          assert.include(text, "vladvlad", "The search query results show up on the page.");
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, "q=vladvlad", "Our params didn't go anywhere.");
        })
        .end();
    },

    "Search works by icon click": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), ".wc-IssueList:nth-of-type(10)")
        .findByCssSelector(".js-SearchForm input")
        .type("vladvlad")
        .end()
        .findByCssSelector(".js-SearchForm button").click()
        .end()
        .findDisplayedByCssSelector(".wc-IssueList:only-of-type a").getVisibleText()
        .then(function(text) {
          assert.include(text, "vladvlad", "The search results show up on the page.");
        })
        .end();
    },

    "Search works by Return key": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), ".js-SearchForm input")
        .findDisplayedByCssSelector(".js-SearchForm input")
        .type("vladvlad")
        .type(keys.ENTER)
        .end()
        .findDisplayedByCssSelector(".wc-IssueList:only-of-type a").getVisibleText()
        .then(function(text) {
          assert.include(text, "vladvlad", "The search results show up on the page.");
        })
        .end();
    },

    "Search from the homepage": function() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-SearchBarOpen")
        .get(require.toUrl(url("/")))
        .findByCssSelector(".js-SearchBarOpen").click()
        .end()
        .findByCssSelector(".js-SearchBar input").click()
        .type("vladvlad")
        .type(keys.ENTER)
        .end()
        .findDisplayedByCssSelector(".wc-IssueList:only-of-type a").getVisibleText()
        .then(function(text) {
          assert.include(text, "vladvlad", "The search query results show up on the page.");
        })
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, "page=1", "Default params got merged.");
        })
        .end();
    }
  });
});
