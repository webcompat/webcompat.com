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

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: "Issues",

    "Issue page loads": function() {
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        .findDisplayedByCssSelector(".wc-Issue-information-header").getVisibleText()
        .then(function(text) {
          assert.include(text, "#100", "Issue title displayed");
        })
        .end()
        .findByCssSelector(".js-Issue-reporter").getVisibleText()
        .then(function(text) {
          assert.equal(text, "miketaylr", "Issue reporter displayed.");
        })
        .end()
        .findByCssSelector(".js-Label").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    "Issue comments load": function() {
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        .findDisplayedByCssSelector(".js-Issue-comment").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .findByCssSelector(".js-Comment-owner").getVisibleText()
        .then(function(text) {
          assert.equal(text, "GIGANTOR", "Commenter name displayed.");
        })
        .end()
        .findByCssSelector(".js-Comment-content").getVisibleText()
        .then(function(text) {
          assert.equal(text, "Today's date is Mon Sep 28 2015", "Comment is displayed.");
        });
    },

    "Pressing g goes to the github issue page": function() {
      var issueNumber = 100;
      return FunctionalHelpers.openPage(this, url("/issues/" + issueNumber), ".js-Issue")
        .findByCssSelector("body").click()
        .type("g")
        .end()
        // look for the issue container on github.com/foo/bar/issues/N
        .findByCssSelector(".gh-header.issue").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "We're at the GitHub issue page now.");
        })
        .end()
        .findByCssSelector(".gh-header-number").getVisibleText()
        .then(function(text) {
          var headerNumber = parseInt(text.slice(1), 10);
          assert.equal(headerNumber, issueNumber, "GitHub issue number matches.");
        });
    },

    "NSFW images are blurred": function() {
      return FunctionalHelpers.openPage(this, url("/issues/396"), ".js-Issue")
        .findDisplayedByCssSelector(".js-Issue-commentList .js-Comment-content p").getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
        })
        .end();
    },

    "Clicking NSFW images toggles between blurry and not-blurry": function() {
      return FunctionalHelpers.openPage(this, url("/issues/396"), ".js-Issue")
        .findDisplayedByCssSelector(".js-Issue-commentList .js-Comment-content p").getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
          assert.notInclude(className, "wc-Comment-content-nsfw--display");
        }).click()
        .end()
        .findByCssSelector(".js-Issue-commentList .js-Comment-content p").getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
          assert.include(className, "wc-Comment-content-nsfw--display");
        }).click()
        .end()
        .findByCssSelector(".js-Issue-commentList .js-Comment-content p").getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
          assert.notInclude(className, "wc-Comment-content-nsfw--display");
        })
        .end();
    }
  });
});
