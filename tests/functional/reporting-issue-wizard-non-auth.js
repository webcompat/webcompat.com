"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");
const path = require("path");
const keys = require("@theintern/leadfoot/keys").default;

const cwd = intern.config.basePath;
const VALID_IMAGE_PATH = path.join(cwd, "tests/fixtures", "green_square.png");
const BAD_IMAGE_PATH = path.join(cwd, "tests/fixtures", "evil.py");

const url = function (path) {
  return intern.config.functionalBaseUrl + path;
};

registerSuite("Reporting with wizard", {
  tests: {
    "Space in domain name validation"() {
      return FunctionalHelpers.openPage(
        this,
        url("issues/new"),
        "#js-ReportForm"
      )
        .findByCssSelector("#url")
        .click()
        .type("http:// example.com")
        .end()
        .execute(function () {
          var elm = document.querySelector("#url");
          WindowHelpers.sendEvent(elm, "blur");
        })
        .sleep(500)
        .findByCssSelector(".form-message-error");
    },
    "URL validation"() {
      return FunctionalHelpers.openPage(
        this,
        url("issues/new"),
        "#js-ReportForm"
      )
        .findByCssSelector("#url")
        .click()
        .type("sup")
        .end()
        .sleep(500)
        .execute(function () {
          var elm = document.querySelector("#url");
          WindowHelpers.sendEvent(elm, "blur");
        })
        .findByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function (texts) {
          assert.include(
            texts,
            "Please enter a valid url starting with https:// or http://",
            "URL validation message is shown"
          );
        })
        .end()
        .findByCssSelector(".next-url")
        .getAttribute("disabled")
        .then(function (attribute) {
          assert.isNotNull(attribute);
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
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          // Make sure that url field is focused
          .getActiveElement()
          .getProperty("id")
          .then(function (elementId) {
            assert.equal(elementId, "url", "Focused element id is #url");
          })
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Web address"
            assert.include(text, "Web address");
          })
          .end()
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          // Click on "Confirm"
          .findByCssSelector(".next-url")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Issue"
            assert.include(text, "Issue");
          })
          .end()
          .execute(function () {
            // Click on "Desktop site instead of mobile site"
            document.querySelector("[for=problem_category-0]").click();
          })
          .sleep(1500)
          // Check that hidden description field has "Desktop site instead of mobile site"
          .findById("description")
          .getAttribute("value")
          .then(function (val) {
            assert.include(val, "Desktop site instead of mobile site");
          })
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Details"
            assert.include(text, "Details");
          })
          .end()
          // Click on "Yes"
          .findByCssSelector(".next-browser")
          .click()
          .end()
          .sleep(500)
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Testing"
            assert.include(text, "Testing");
          })
          .end()
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
          // Make sure that "Tested Another Browser" is true
          .findByCssSelector("#browser_test-0")
          .getProperty("checked")
          .then(function (value) {
            assert.equal(value, true);
          })
          .end()
          // Click on "Confirm"
          .findByCssSelector(".next-tested")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Description"
            assert.include(text, "Description");
          })
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
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Screenshot"
            assert.include(text, "Screenshot");
          })
          .end()
          // Upload an image
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .sleep(1000)
          .findDisplayedByCssSelector(".next-screenshot")
          .getVisibleText()
          .then(function (text) {
            // Make sure that there is "Continue" button after uploading
            assert.include(text, "Continue", "Continue with image attached");
          })
          // Click on "Continue"
          .click()
          .end()
          .sleep(1500)
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Send report"
            assert.include(text, "Send report");
          })
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
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Web address"
            assert.include(text, "Web address");
          })
          .end()
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          // Click on "Confirm"
          .findByCssSelector(".next-url")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Issue"
            assert.include(text, "Issue");
          })
          .end()
          .execute(function () {
            // Click on "Design is broken"
            document.querySelector("[for=problem_category-2]").click();
          })
          .sleep(500)
          .execute(function () {
            // Click on "Images not loaded"
            document.querySelector("[for=layout_bug_subcategory-0]").click();
          })
          .sleep(1500)
          // Check that hidden description field has "Images not loaded"
          .findById("description")
          .getAttribute("value")
          .then(function (val) {
            assert.include(val, "Images not loaded");
          })
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Details"
            assert.include(text, "Details");
          })
          .end()
          // Click on "different device or browser"
          .findByCssSelector(".next-custom")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is still "Details"
            assert.include(text, "Details");
          })
          .end()
          // Clear the "Browser" field
          .findById("browser")
          .clearValue()
          .end()
          .findByCssSelector(".button.next-custom")
          .getAttribute("disabled")
          .then(function (attribute) {
            // Make sure  that "Confirm" button is disabled when "Browser" field is empty
            assert.isNotNull(attribute);
          })
          .end()
          .findById("browser")
          // Fill in the "Browser" field
          .type("Firefox 76.0")
          .end()
          .sleep(500)
          .findByCssSelector(".step-custom-browser")
          .click()
          .end()
          // Click on "Confirm"
          .findByCssSelector(".button.next-custom")
          .click()
          .end()
          .sleep(1000)
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Testing"
            assert.include(text, "Testing");
          })
          .end()
          // Click on "I have only tested on this browser"
          .findByCssSelector(".no-other-browser")
          .click()
          .end()
          // Make sure that "Tested Another Browser" is false
          .findByCssSelector("#browser_test-1")
          .getProperty("checked")
          .then(function (value) {
            assert.equal(value, true);
          })
          .end()
          .execute(function () {
            // Click on "What is a web compatibility issue?"
            document.querySelector(".popup-trigger").click();
          })
          .end()
          // Make sure that popup is visible and close it
          .findDisplayedByCssSelector(".popup-modal.is--visible")
          .findByCssSelector(".popup-modal__close")
          .click()
          .end()
          .end()
          .sleep(1000)
          .findByCssSelector(".button.next-warning")
          .getVisibleText()
          .then(function (text) {
            // Make sure there is "Continue without testing" button
            assert.include(text, "Continue without testing");
          })
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Description"
            assert.include(text, "Description");
          })
          .end()
          // Enter more than 30 characters in the description field
          .findById("steps_reproduce")
          .type("This paragraph contains more than 30 characters")
          .end()
          .sleep(500)
          // Click "Continue"
          .findByCssSelector(".next-description")
          .click()
          .end()
          .sleep(1000)
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Screenshot"
            assert.include(text, "Screenshot");
          })
          .end()
          .findDisplayedByCssSelector(".next-screenshot")
          .getVisibleText()
          .then(function (text) {
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
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Send report"
            assert.include(text, "Send report");
          })
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
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Web address"
            assert.include(text, "Web address");
          })
          .end()
          // Manual url enter
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          .execute(function () {
            // Click on "Learn more about web compatibility" link
            document.querySelector(".popup-trigger").click();
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
          .findByCssSelector(".next-url")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Issue"
            assert.include(text, "Issue");
          })
          .end()
          .execute(function () {
            // Click on "Something else"
            document.querySelector("[for=problem_category-4]").click();
          })
          .sleep(500)
          // Make sure that other problem field is focused
          .getActiveElement()
          .getProperty("id")
          .then(function (elementId) {
            assert.equal(
              elementId,
              "other_problem",
              "Focused element id is #other_problem"
            );
          })
          .end()
          .findByCssSelector(".next-category")
          .getAttribute("disabled")
          .then(function (attribute) {
            // Make sure that "Confirm" button is disabled if there is no problem description
            assert.isNotNull(attribute);
          })
          .end()
          // Fill in "Issue description"
          .findById("other_problem")
          .type("some problem")
          .end()
          .sleep(500)
          // Click on "Confirm" button
          .findByCssSelector(".next-category")
          .click()
          .end()
          .sleep(1000)
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Details"
            assert.include(text, "Details");
          })
          .end()
          // Click on "Yes"
          .findDisplayedByCssSelector(".next-browser")
          .click()
          .end()
          .sleep(500)
          // Check that hidden description field has "some problem"
          .findById("description")
          .getAttribute("value")
          .then(function (val) {
            assert.include(val, "some problem");
          })
          .end()
          .execute(function () {
            // Click on "Other" in the browsers list
            document.querySelector("[for=tested_browsers-5]").click();
          })
          .end()
          .sleep(1000)
          // Make sure that "Tested Another Browser" is true
          .findByCssSelector("#browser_test-0")
          .getProperty("checked")
          .then(function (value) {
            assert.equal(value, true);
          })
          .end()
          // Click on "Confirm" button
          .findDisplayedByCssSelector(".next-tested")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Description"
            assert.include(text, "Description");
          })
          .end()
          // Enter less than 30 characters
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
          // Enter more than 30 characters in the description field
          .findById("steps_reproduce")
          .clearValue()
          .type("This paragraph contains more than 30 characters")
          .end()
          .sleep(500)
          // Click "Continue"
          .findByCssSelector(".next-description")
          .click()
          .end()
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Screenshot"
            assert.include(text, "Screenshot");
          })
          .end()
          // Upload an image
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .sleep(1000)
          // Delete the image
          .findByCssSelector(".button.js-remove-upload")
          .click()
          .end()
          .findDisplayedByCssSelector(".next-screenshot")
          .getVisibleText()
          .then(function (text) {
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
          // Change for a bad image
          .findByCssSelector("#image")
          .type(BAD_IMAGE_PATH)
          .end()
          // check the error message
          .findByCssSelector(".form-upload-error")
          .getVisibleText()
          .then(function (text) {
            assert.include(
              text,
              "Image must be one of the following",
              "Image type validation message is shown"
            );
          })
          .end()
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function (inlineStyle) {
            assert.notInclude(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "The previous valid image preview should be removed."
            );
          })
          .end()
          .findByCssSelector(".js-label-upload")
          .isDisplayed()
          .then(function (isDisplayed) {
            assert.isFalse(
              isDisplayed,
              "Upload label is hidden while the error is displayed"
            );
          })
          .end()
          // pick a valid file type
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          // validation message should be gone
          .waitForDeletedByCssSelector(".form-upload-error")
          .end()
          .sleep(500)
          .findDisplayedByCssSelector(".next-screenshot")
          .getVisibleText()
          .then(function (text) {
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
          .findByCssSelector(".step.active .description")
          .getVisibleText()
          .then(function (text) {
            // Make sure that progress label is "Send report"
            assert.include(text, "Send report");
          })
          .end()
          // Make sure "Report via Github" is visible
          .findDisplayedById("submitgithub")
          .end()
          // Make sure "Report Anonymously" is visible
          .findDisplayedById("open-username")
          .end()
      );
    },
    "Learn more modal - closing with Esc": function () {
      return (
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          .execute(() => {
            // Click on "What is a web compatibility issue?"
            document
              .querySelector("[data-popup-trigger='what-is-compat']")
              .click();
          })
          .end()
          // Make sure that popup is visible and close it
          .findDisplayedByCssSelector(".popup-modal.is--visible")
          .pressKeys(keys.ESCAPE)
          .end()
          .findByCssSelector(".popup-modal")
          .getAttribute("class")
          .then((className) => {
            assert.notInclude("is--visible", className);
          })
          .end()
          .execute(() => {
            // Click on "All information included in this report will
            //           be publicly visible. Learn More?" modal
            document
              .querySelector("[data-popup-trigger='privacy-modal']")
              .click();
          })
          .end()
          // Make sure that popup is visible and close it
          .findDisplayedByCssSelector(".popup-modal.is--visible")
          .pressKeys(keys.ESCAPE)
          .end()
          .findByCssSelector(".popup-modal")
          .getAttribute("class")
          .then((className) => {
            assert.notInclude("is--visible", className);
          })
          .end()
      );
    },
    "Left and right key modal navigation": function () {
      return (
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          .execute(() => {
            // Click on "What is a web compatibility issue?"
            document
              .querySelector("[data-popup-trigger='what-is-compat']")
              .click();
          })
          .findDisplayedByCssSelector(".popup-modal.is--visible")
          .execute(() => {
            // calling pressKeys(keys.ARROW_RIGHT), etc. seems to fail
            // in Firefox, but not Chrome. So just dispatch them manually.
            let right = new KeyboardEvent("keydown", {
              key: "ArrowRight",
              keyCode: 39,
              which: 39,
            });
            let left = new KeyboardEvent("keydown", {
              key: "ArrowLeft",
              keyCode: 37,
              which: 37,
            });
            document.dispatchEvent(right);
            document.dispatchEvent(right);
            document.dispatchEvent(left);
          })
          .end()
          .findByCssSelector(".dot.active")
          .getAttribute("data-slide")
          // two rights and a left should leave us in the middle
          .then((dataset) => {
            assert.include(dataset, "1");
          })
          .end()
      );
    },
    "Enter can select category": function () {
      return (
        FunctionalHelpers.openPage(this, url("issues/new"), "#js-ReportForm")
          .findByCssSelector("#url")
          .type("http://example.com")
          .end()
          // Click on "Confirm"
          .findByCssSelector(".next-url")
          .click()
          .end()
          .execute(() => {
            let label = document.querySelector("#problem_category-0 + label");
            let enter = new KeyboardEvent("keydown", {
              code: "Enter",
              keyCode: 13,
              which: 13,
            });

            label.dispatchEvent(enter);
          })
          .findByCssSelector("#problem_category-0")
          .getProperty("checked")
          .then((checkedProp) => {
            assert.isTrue(checkedProp);
          })
          .end()
          .execute(() => {
            let label2 = document.querySelector("#problem_category-1 + label");
            let enter = new KeyboardEvent("keydown", {
              code: "Enter",
              keyCode: 13,
              which: 13,
            });

            label2.dispatchEvent(enter);
          })
          .findByCssSelector("#problem_category-0")
          .getProperty("checked")
          .then((checkedProp) => {
            assert.isFalse(checkedProp);
          })
          .end()
          .findByCssSelector("#problem_category-1")
          .getProperty("checked")
          .then((checkedProp) => {
            assert.isTrue(checkedProp);
          })
          .end()
      );
    },
  },
});
