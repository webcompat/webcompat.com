/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  "intern",
  "intern!object",
  "intern/chai!assert",
  "require",
  "tests/functional/lib/helpers"
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  "use strict";

  var url = function(path, params) {
    var base = intern.config.siteRoot + path;
    return params ? base + params : base;
  };

  registerSuite({
    name: "Search (non-auth)",

    "Pressing g inside of search input *doesnt* go to github issues": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), "#js-SearchForm-input")
        .findByCssSelector("#js-SearchForm-input").click()
        .type("g")
        .end()
        // set a short timeout, so we don't have to wait 10 seconds
        // to realize we're not at GitHub.
        .setFindTimeout(0)
        .findByCssSelector(".repo-container .issues-listing")
        .then(assert.fail, function(err) {
          assert.isTrue(/NoSuchElement/.test(String(err)));
        })
        .end();
    },

    "Results are loaded from the query params": function() {
      var params = "?q=vladvlad";

      return FunctionalHelpers.openPage(this, url("/issues", params), ".wc-IssueList:only-of-type a")
        .findDisplayedByCssSelector(".wc-IssueList:only-of-type a").getVisibleText()
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

    "Clicking on label search adds query parameter to the URL": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), "[data-remotename=browser-android")
        .findByCssSelector("[data-remotename=browser-android]").click()
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(currUrl, "q=label%3Abrowser-android", "Url updated with label name");
        })
        .end();
    },

    "Clicking on label search updates the search input": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), "[data-remotename=browser-android")
        .findByCssSelector("[data-remotename=browser-android]").click()
        .end()
        .findDisplayedById("js-SearchForm-input").getProperty("value")
        .then(function(searchText) {
          assert.include(searchText, "label:browser-android", "Url updated with label name");
        })
        .end();
    },

    "Search input is visible": function() {
      return FunctionalHelpers.openPage(this, url("/issues"), ".js-SearchForm")
        .findByCssSelector(".js-SearchForm").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "Search input is visible for non-authed users.");
        })
        .end();
    }
  });
});
