"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function (path) {
  return intern.config.functionalBaseUrl + path;
};

registerSuite("Milestones (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Milestone editor opens then closes (clicks)"() {
      return FunctionalHelpers.openPage(
        this,
        url("issues/2"),
        ".js-MilestoneEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-MilestoneEditorLauncher")
        .click()
        .end()
        .findByCssSelector(".js-CategoryEditor")
        .end()
        .findByCssSelector(".js-CategoryEditor-close")
        .click()
        .end()
        .findByCssSelector(".js-MilestoneEditorLauncher")
        .click()
        .getAttribute("class")
        .then(function (className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Milestone editor opens then closes (key events)"() {
      return FunctionalHelpers.openPage(
        this,
        url("issues/2"),
        ".js-MilestoneEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector("body")
        .type("m")
        .end()
        .findByCssSelector(".js-MilestoneEditor-search")
        .type("\uE00C")
        .end()
        .findByCssSelector(".js-MilestoneEditorLauncher")
        .click()
        .getAttribute("class")
        .then(function (className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Clicking outside milestone editor closes it"() {
      return FunctionalHelpers.openPage(
        this,
        url("issues/2"),
        ".js-MilestoneEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-MilestoneEditorLauncher")
        .click()
        .end()
        .findByCssSelector(".js-CategoryEditor")
        .end()
        .findByCssSelector(".navigation")
        .click()
        .end()
        .findByCssSelector(".js-MilestoneEditorLauncher")
        .getAttribute("class")
        .then(function (className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Clicking close button actually closes it"() {
      return FunctionalHelpers.openPage(
        this,
        url("issues/2"),
        ".js-MilestoneEditorLauncher",
        true /* longerTimeout */
      )
        .execute(() => {
          document.querySelector(".js-MilestoneEditorLauncher").click();
        })
        .findByCssSelector(".js-CategoryEditor-close")
        .click()
        .end()
        .findByCssSelector(".js-MilestoneEditorLauncher")
        .getAttribute("class")
        .then(function (className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Missing status error displays": function () {
      FunctionalHelpers.openPage(
        this,
        url("issues/9"),
        ".js-Issue",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-Milestone")
        .getVisibleText();

      return FunctionalHelpers.openPage(
        this,
        url("issues/9"),
        ".js-Issue",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-Milestone")
        .getVisibleText()
        .then(function (text) {
          // check that the title loaded, it won't be there if the page didn't render.
          assert.strictEqual(text, "Fix me: assign a status");
        })
        .end();
    },
  },
});
