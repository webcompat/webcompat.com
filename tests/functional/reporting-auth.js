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

registerSuite("Reporting (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Wizard stepper - scenario 1 for authorized user"() {
      return (
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          // Click on "Confirm"
          .findByCssSelector(".next-url")
          .click()
          .end()
          .execute(function () {
            // Click on "Desktop site instead of mobile site"
            document.querySelector("[for=problem_category-0]").click();
          })
          .sleep(1000)
          // Click on "Yes"
          .findByCssSelector(".next-browser")
          .click()
          .end()
          .sleep(500)
          .findByCssSelector(".next-tested")
          .getAttribute("disabled")
          .then(function (attribute) {
            // Make sure that "Confirm" button is disabled if browser is not selected
            assert.isNotNull(attribute);
          })
          .execute(function () {
            // Click on "Chrome"
            document.querySelector("[for=tested_browsers-0]").click();
          })
          .end()
          .sleep(500)
          // Click on "Confirm"
          .findByCssSelector(".next-tested")
          .click()
          .end()
          // Enter less than 30 characters in the description field
          .findById("steps_reproduce")
          .type("not enough characters")
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".next-description")
          .getAttribute("disabled")
          .then(function (attribute) {
            // Make sure "Continue" is disabled if there are not enough characters
            assert.isNotNull(attribute);
          })
          .end()
          .findById("steps_reproduce")
          .clearValue()
          // Enter more than 30 characters in the description field
          .type("This paragraph contains more than 30 characters")
          .end()
          .sleep(500)
          // Click on "Continue"
          .findByCssSelector(".next-description")
          .click()
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".next-screenshot")
          // Click on "Continue without"
          .click()
          .end()
          .sleep(500)
          // Make sure Report as FooUser (logged in)
          .findByCssSelector("#submitgithub")
          .getVisibleText()
          .then(function (text) {
            assert.include(text, "Report as");
          })
      );
    },
  },
});
