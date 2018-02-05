"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");
const path = require("path");

var cwd = intern.config.basePath;
var VALID_IMAGE_PATH = path.join(cwd, "tests/fixtures", "green_square.png");
var BAD_IMAGE_PATH = path.join(cwd, "tests/fixtures", "evil.py");
// DETAILS_STRING is a URL encoded object, stringified to JSON.
var DETAILS_STRING =
  '{"gfx.webrender.all"%3Afalse%2C"gfx.webrender.blob-images"%3A2%2C"gfx.webrender.enabled"%3Afalse%2C"image.mem.shared"%3A2%2C"layout.css.servo.enabled"%3Atrue}';

var url = function(path) {
  return intern.config.siteRoot + path;
};

registerSuite("Reporting (non-auth)", {
  tests: {
    "Submit buttons are disabled"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".wc-ReportForm-actions-button"
      )
        .findAllByCssSelector(".wc-ReportForm-actions-button button")
        .getAttribute("class")
        .then(function(classNames) {
          classNames.forEach(function(className) {
            assert.include(className, "is-disabled");
          });
        })
        .end();
    },

    "Wyciwyg bug workaround"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new?url=wyciwyg://0/http://bbs.csdn.net/topics/20282413"),
        "#url"
      )
        .findByCssSelector("#url")
        .getProperty("value")
        .then(function(value) {
          assert.notInclude(value, "wyciwyg://0/");
        })
        .end();
    },

    "Report button shows via GitHub"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".wc-ReportForm-actions-button"
      )
        .findByCssSelector("#submitgithub")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "Report via"); //Report via GitHub (logged out)
        })
        .end();
    },

    "URL validation"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".wc-ReportForm-actions-button"
      )
        .findByCssSelector("#url")
        .click()
        .end()
        .execute(function() {
          var elm = document.querySelector("#url");
          WindowHelpers.sendEvent(elm, "input");
        })
        .sleep(500)
        .findByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "A valid URL is required",
            "URL validation message is shown"
          );
        })
        .end()
        .findByCssSelector("#url")
        .type("sup")
        .end()
        .waitForDeletedByCssSelector(".form-message-error")
        .end();
    },

    "Description validation"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          .findByCssSelector("#description")
          .click()
          .end()
          .execute(function() {
            var elm = document.querySelector("#description");
            WindowHelpers.sendEvent(elm, "input");
          })
          .sleep(500)
          .findByCssSelector(".form-message-error")
          .getVisibleText()
          .then(function(text) {
            assert.include(
              text,
              "Description required.",
              "Description validation message is shown"
            );
          })
          .end()
          // enter a bug description
          .findByCssSelector("#description")
          .type("bug description")
          .end()
          // validation message should be gone
          .waitForDeletedByCssSelector(".form-message-error")
          .end()
      );
    },

    "(optional) browser + os validation"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          // make sure we can see the valid checkbox (i.e. it's background image is non-empty)
          .execute(function() {
            return window
              .getComputedStyle(
                document.querySelector(".js-bug-form-os"),
                ":after"
              )
              .getPropertyValue("background-image");
          })
          .then(function(bgImage) {
            assert.include(
              bgImage,
              "valid.svg",
              "The valid checkbox pseudo is visible"
            );
          })
          .end()
          .execute(function() {
            var elm = document.querySelector("#os");
            elm.value = "";
            WindowHelpers.sendEvent(elm, "input");
          })
          .end()
          .sleep(500)
          // make sure we can't see the valid checkbox (i.e. it's background image is empty)
          .execute(function() {
            return window
              .getComputedStyle(
                document.querySelector(".js-bug-form-os"),
                ":after"
              )
              .getPropertyValue("background-image");
          })
          .then(function(bgImage) {
            assert.notInclude(
              bgImage,
              "valid.svg",
              "The valid checkbox pseudo is not visible"
            );
          })
          .end()
      );
    },

    "Image extension validation"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          .findByCssSelector("#image")
          .type(BAD_IMAGE_PATH)
          .end()
          .findByCssSelector(".form-upload-error")
          .getVisibleText()
          .then(function(text) {
            assert.include(
              text,
              "Image must be one of the following",
              "Image type validation message is shown"
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
      );
    },

    "Submits are enabled"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          // pick a valid file type
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .findByCssSelector("#url")
          .type("http://coolguy.biz")
          .end()
          // pick a problem type
          .findByCssSelector("#problem_category-0")
          .click()
          .end()
          .findByCssSelector("#description")
          .type("test for desktop site")
          //.click()
          .end()
          // wait a bit
          .sleep(250)
          // now make sure the buttons aren't disabled anymore
          .findAllByCssSelector(".wc-ReportForm-actions-button button")
          .getAttribute("class")
          .then(function(classNames) {
            classNames.forEach(function(className) {
              assert.notInclude(className, "is-disabled");
            });
          })
          .end()
      );
    },

    "problem_type param selects problem type"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new?problem_type=video_bug"),
        ".wc-ReportForm-actions-button"
      )
        .findByCssSelector("[value=video_bug]")
        .isSelected()
        .then(function(isSelected) {
          assert.isTrue(isSelected, "The right option is selected");
        })
        .end();
    },

    "details param adds info to description"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new?details=" + DETAILS_STRING),
        "#description"
      )
        .findByCssSelector("#steps_reproduce")
        .getProperty("value")
        .then(function(text) {
          assert.notInclude(
            text,
            "gfx.webrender.all:+false",
            "+ not found in decoded string"
          );
          assert.include(
            text,
            "gfx.webrender.all: false\ngfx.webrender.blob-images: 2\ngfx.webrender.enabled: false\nimage.mem.shared: 2\nlayout.css.servo.enabled: true\n",
            "+ replaced with space"
          );
        });
    }
  }
});
