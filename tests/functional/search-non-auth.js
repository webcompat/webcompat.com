"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function(path, params) {
  var base = intern.config.siteRoot + path;
  return params ? base + params : base;
};

registerSuite("Search (non-auth)", {
  tests: {
    "Pressing g inside of search input *doesnt* go to github issues"() {
      return (
        FunctionalHelpers.openPage(this, url("/issues"), "#js-SearchForm-input")
          .findByCssSelector("#js-SearchForm-input")
          .click()
          .type("g")
          .end()
          // set a short timeout, so we don't have to wait 10 seconds
          // to realize we're not at GitHub.
          .setFindTimeout(0)
          .findByCssSelector(".repo-container .issues-listing")
          .then(assert.fail, function(err) {
            assert.isTrue(/NoSuchElement/.test(String(err)));
          })
          .end()
      );
    },

    "Clicking on label search adds query parameter to the URL"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        "[data-remotename=browser-android"
      )
        .findByCssSelector("[data-remotename=browser-android]")
        .click()
        .end()
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.include(
            currUrl,
            "q=label%3Abrowser-android",
            "Url updated with label name"
          );
        })
        .end();
    },

    "Clicking on label search updates the search input"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues"),
        "[data-remotename=browser-android"
      )
        .findByCssSelector("[data-remotename=browser-android]")
        .click()
        .sleep(2000)
        .end()
        .findDisplayedById("js-SearchForm-input")
        .getProperty("value")
        .then(function(searchText) {
          assert.include(
            searchText,
            "label:browser-android",
            "Url updated with label name"
          );
        })
        .end();
    },

    "Search input is visible"() {
      return FunctionalHelpers.openPage(this, url("/issues"), ".js-SearchForm")
        .findByCssSelector(".js-SearchForm")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(
            isDisplayed,
            true,
            "Search input is visible for non-authed users."
          );
        })
        .end();
    },

    "Empty search input removes q param"() {
      // load up a garbage search, so we can more easily detect when
      // the search values we want are loaded.
      var searchParam = "?q=fffffff";
      return FunctionalHelpers.openPage(
        this,
        url("/issues", searchParam),
        ".js-SearchForm"
      )
        .findByCssSelector("#js-SearchForm-input")
        .clearValue()
        .click()
        .type("")
        .type("\uE007")
        .sleep(3000)
        .getCurrentUrl()
        .then(function(currUrl) {
          assert.notInclude(currUrl, "fffffff", "old search param was removed");
        })
        .end();
    }
  }
});
