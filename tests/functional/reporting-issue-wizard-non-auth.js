"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");
const path = require("path");

const cwd = intern.config.basePath;
const VALID_IMAGE_PATH = path.join(cwd, "tests/fixtures", "green_square.png");

const url = function(path) {
  return intern.config.siteRoot + path;
};

registerSuite("Reporting with wizard", {
  before() {
    return FunctionalHelpers.setCookie(this, { name: "exp", value: "form-v2" });
  },

  after() {
    return FunctionalHelpers.deleteCookie(this, "exp");
  },

  tests: {
    "Space in domain name validation"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        "#js-ReportForm"
      )
        .findByCssSelector("#url")
        .click()
        .type("http:// example.com")
        .end()
        .execute(function() {
          var elm = document.querySelector("#url");
          WindowHelpers.sendEvent(elm, "blur");
        })
        .sleep(500)
        .findByCssSelector(".form-message-error");
    },
    "URL validation"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        "#js-ReportForm"
      )
        .findByCssSelector("#url")
        .click()
        .type("sup")
        .end()
        .sleep(500)
        .execute(function() {
          var elm = document.querySelector("#url");
          WindowHelpers.sendEvent(elm, "blur");
        })
        .findByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function(texts) {
          assert.include(
            texts,
            "A valid URL is required",
            "URL validation message is shown"
          );
        })
        .end()
        .findByCssSelector(".button.step-1")
        .getAttribute("class")
        .then(function(className) {
          assert.include(className, "disabled");
        })
        .end()
        .findByCssSelector("#url")
        .clearValue()
        .type("http://sup.com")
        .end()
        .waitForDeletedByCssSelector(".form-message-error")
        .end();
    },
    "Wizard stepper - scenario 1"() {
      return (
        FunctionalHelpers.openPage(this, url("/issues/new"), "#js-ReportForm")
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          // Click on "Confirm"
          .findByCssSelector(".button.step-1")
          .click()
          .end()
          .execute(function() {
            // Click on "Desktop site instead of mobile site"
            $("[for=problem_category-0]")[0].click();
          })
          .sleep(1000)
          // Click on "Yes"
          .findByCssSelector(".button.step-4")
          .click()
          .end()
          .sleep(500)
          .findByCssSelector(".button.step-6")
          .getAttribute("class")
          .then(function(className) {
            // Make sure that "Confirm" button is disabled if browser is not selected
            assert.include(className, "disabled");
          })
          .execute(function() {
            // Click on "Chrome"
            $("[for=tested_browsers-0]")[0].click();
          })
          .end()
          .sleep(500)
          // Click on "Confirm"
          .findByCssSelector(".button.step-6")
          .click()
          .end()
          // Enter less than 30 characters in the description field
          .findById("steps_reproduce")
          .type("not enough characters")
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".button.step-8")
          .getAttribute("class")
          .then(function(className) {
            // Make sure "Continue" is disabled if there are not enough characters
            assert.include(className, "disabled");
          })
          .end()
          .findById("steps_reproduce")
          .clearValue()
          // Enter more than 30 characters in the description field
          .type("This paragraph contains more than 30 characters")
          .end()
          .sleep(500)
          // Click on "Continue"
          .findByCssSelector(".button.step-8")
          .click()
          .end()
          // Upload an image
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".button.step-10")
          .getVisibleText()
          .then(function(text) {
            // Make sure that there is "Continue" button after uploading
            assert.include(text, "Continue", "Continue with image attached");
          })
          // Click on "Continue"
          .click()
          .end()
          // Make sure "Report via Github" is visible
          .findDisplayedById("submitgithub")
          .end()
          // Make sure "Report Anonymously" is visible
          .findDisplayedById("open-username")
          .end()
      );
    },
    "Wizard stepper - scenario 2"() {
      return (
        FunctionalHelpers.openPage(this, url("/issues/new"), "#js-ReportForm")
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          // Click on "Confirm"
          .findByCssSelector(".button.step-1")
          .click()
          .end()
          .execute(function() {
            // Click on "Design is broken"
            $("[for=problem_category-2]")[0].click();
            // Click on "Images not loaded"
            $("[for=layout_bug_subcategory-0]")[0].click();
          })
          .sleep(1000)
          // Click on "different device or browser"
          .findByCssSelector(".next-step.step-5")
          .click()
          .end()
          // Clear the "Browser" field
          .findById("browser")
          .clearValue()
          .end()
          .findByCssSelector(".button.step-5")
          .getAttribute("class")
          .then(function(className) {
            // Make sure  that "Confirm" button is disabled when "Browser" field is empty
            assert.include(className, "disabled");
          })
          .end()
          .findById("browser")
          // Fill in the "Browser" field
          .type("Firefox 76.0")
          .end()
          .sleep(500)
          .findByCssSelector(".step-container.step5 ")
          .click()
          .end()
          // Click on "Confirm"
          .findByCssSelector(".button.step-5")
          .click()
          .end()
          .sleep(1000)
          // Click on "I have only tested on this browser"
          .findByCssSelector(".no-other-browser")
          .click()
          .end()
          .execute(function() {
            // Click on "What is a web compatibility issue?"
            $(".popup-trigger")[0].click();
          })
          .end()
          // Make sure that popup is visible and close it
          .findDisplayedByCssSelector(".popup-modal.is--visible")
          .findByCssSelector(".popup-modal__close")
          .click()
          .end()
          .end()
          .sleep(500)
          .findByCssSelector(".button.step-7")
          .getVisibleText()
          .then(function(text) {
            // Make sure there is "Continue without testing" button
            assert.include(text, "Continue without testing");
          })
          .click()
          .end()
          // Enter more than 30 characters in the description field
          .findById("steps_reproduce")
          .type("This paragraph contains more than 30 characters")
          .end()
          .sleep(500)
          // Click "Continue"
          .findByCssSelector(".button.step-8")
          .click()
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".button.step-10")
          .getVisibleText()
          .then(function(text) {
            // Make sure there is "Continue without" button if there is no image
            assert.include(
              text,
              "Continue without",
              "Continue without image attached"
            );
          })
          // Click on "Continue without"
          .click()
          .end()
          // Make sure "Report via Github" is visible
          .findDisplayedById("submitgithub")
          .end()
          // Make sure "Report Anonymously" is visible
          .findDisplayedById("open-username")
          .end()
      );
    },
    "Wizard stepper - scenario 3"() {
      return (
        FunctionalHelpers.openPage(this, url("/issues/new"), "#js-ReportForm")
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          .execute(function() {
            // Click on "Learn more about web compatibility" link
            $(".popup-trigger")[0].click();
          })
          .end()
          // Make sure that popup is visible an close it
          .findDisplayedByCssSelector(".popup-modal.is--visible")
          .findByCssSelector(".popup-modal__close")
          .click()
          .end()
          .end()
          .sleep(500)
          // Click on "Confirm"
          .findByCssSelector(".button.step-1")
          .click()
          .end()
          .execute(function() {
            // Click on "Something else"
            $("[for=problem_category-4]")[0].click();
          })
          .sleep(500)
          .findByCssSelector(".button.step-3")
          .getAttribute("class")
          .then(function(className) {
            // Make sure that "Confirm" button is disabled if there is no problem description
            assert.include(className, "disabled");
          })
          .end()
          // Fill in "Issue description"
          .findById("other_problem")
          .type("some problem")
          .end()
          .sleep(500)
          // Click on "Confirm" button
          .findByCssSelector(".button.step-3")
          .click()
          .end()
          .sleep(1000)
          // Click on "Yes"
          .findDisplayedByCssSelector(".button.step-4")
          .click()
          .end()
          .sleep(500)
          .execute(function() {
            // Click on "Other" in the browsers list
            $("[for=tested_browsers-5]")[0].click();
          })
          .end()
          .sleep(1000)
          // Click on "Confirm" button
          .findDisplayedByCssSelector(".button.step-6")
          .click()
          .end()
          // Enter less than 30 characters
          .findById("steps_reproduce")
          .type("not enough characters")
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".button.step-8")
          .getAttribute("class")
          .then(function(className) {
            // Make sure "Continue" is disabled if there are not enough characters
            assert.include(className, "disabled");
          })
          .end()
          // Enter more than 30 characters in the description field
          .findById("steps_reproduce")
          .clearValue()
          .type("This paragraph contains more than 30 characters")
          .end()
          .sleep(500)
          // Click "Continue"
          .findByCssSelector(".button.step-8")
          .click()
          .end()
          // Upload an image
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .sleep(500)
          // Delete the image
          .findByCssSelector(".button.js-remove-upload")
          .click()
          .end()
          .findDisplayedByCssSelector(".button.step-10")
          .getVisibleText()
          .then(function(text) {
            // Make sure there is "Continue without" button after image deletion
            assert.include(
              text,
              "Continue without",
              "Continue without image attached after deletion"
            );
          })
          .end()
          // Upload an image again
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".button.step-10")
          .getVisibleText()
          .then(function(text) {
            // Make sure there is "Continue" button after second upload
            assert.include(
              text,
              "Continue",
              "Continue with image attached after reupload"
            );
          })
          // Click "Continue"
          .click()
          .end()
          // Make sure "Report via Github" is visible
          .findDisplayedById("submitgithub")
          .end()
          // Make sure "Report Anonymously" is visible
          .findDisplayedById("open-username")
          .end()
      );
    }
  }
});
