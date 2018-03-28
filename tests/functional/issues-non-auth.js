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

registerSuite("Issues", {
  tests: {
    "Issue page loads"() {
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        .findDisplayedByCssSelector(".js-issue-number")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "#100", "Issue title displayed");
        })
        .end()
        .findByCssSelector(".js-Issue-reporter")
        .getVisibleText()
        .then(function(text) {
          assert.equal(text, "miketaylr", "Issue reporter displayed.");
        })
        .end()
        .findByCssSelector(".js-Label")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        });
    },

    "Issue comments load"() {
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        .findDisplayedByCssSelector(".js-Issue-comment")
        .isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .findByCssSelector(".js-Comment-owner")
        .getVisibleText()
        .then(function(text) {
          assert.equal(text, "GIGANTOR", "Commenter name displayed.");
        })
        .end()
        .findByCssSelector(".js-Comment-content")
        .getVisibleText()
        .then(function(text) {
          assert.equal(
            text,
            "Today's date is Mon Sep 28 2015",
            "Comment is displayed."
          );
        });
    },

    "Pressing g goes to the github issue page"() {
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        .findByCssSelector("body")
        .click()
        .type("g")
        .end()
        .sleep(500)
        .getCurrentUrl()
        .then(function(url) {
          assert.match(
            url,
            /[https://github.com/^*/^*/issues/100]/,
            "We're at the GitHub issue page now."
          );
        });
    },

    "NSFW images are blurred"() {
      return FunctionalHelpers.openPage(this, url("/issues/396"), ".js-Issue")
        .findDisplayedByCssSelector(
          ".js-Issue-commentList .js-Comment-content p"
        )
        .getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
        })
        .end();
    },

    "Clicking NSFW images toggles between blurry and not-blurry"() {
      return FunctionalHelpers.openPage(this, url("/issues/396"), ".js-Issue")
        .findDisplayedByCssSelector(
          ".js-Issue-commentList .js-Comment-content p"
        )
        .getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
          assert.notInclude(className, "wc-Comment-content-nsfw--display");
        })
        .click()
        .end()
        .findByCssSelector(".js-Issue-commentList .js-Comment-content p")
        .getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
          assert.include(className, "wc-Comment-content-nsfw--display");
        })
        .click()
        .end()
        .findByCssSelector(".js-Issue-commentList .js-Comment-content p")
        .getAttribute("class")
        .then(function(className) {
          assert.include(className, "wc-Comment-content-nsfw");
          assert.notInclude(className, "wc-Comment-content-nsfw--display");
        })
        .end();
    }
  }
});
