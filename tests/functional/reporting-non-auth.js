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
        ".js-report-buttons"
      )
        .findAllByCssSelector(".js-report-buttons button")
        .getAttribute("disabled")
        .then(function(values) {
          values.forEach(function(value) {
            assert.isNotNull(value);
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
        ".js-report-buttons"
      )
        .findByCssSelector("#submitgithub")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "Report via"); //Report via GitHub (logged out)
        })
        .end();
    },

    "space in domain name validation"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-report-buttons"
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
        ".js-report-buttons"
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
        .findByCssSelector("#url")
        .clearValue()
        .type("http://sup.com")
        .end()
        .waitForDeletedByCssSelector(".form-message-error")
        .end();
    },

    "Description validation"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".js-report-buttons"
        )
          .findByCssSelector("#url")
          .type("http://coolguy.biz")
          .end()
          // pick a problem type
          .findByCssSelector("[for=problem_category-0]")
          .click()
          .end()
          .findByCssSelector(".js-Button-wrapper")
          .click()
          .end()
          .sleep(500)
          .findByCssSelector(".form-message-error")
          .getVisibleText()
          .then(function(text) {
            assert.include(
              text,
              "A problem summary is required",
              "Problem summary validation message is shown"
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
          ".js-report-buttons"
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
              "checkmark.svg",
              "The valid checkbox pseudo is visible"
            );
          })
          .end()
          .execute(function() {
            var elm = document.querySelector("#os");
            elm.value = "";
            WindowHelpers.sendEvent(elm, "blur");
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
              "checkmark.svg",
              "The valid checkbox pseudo is not visible"
            );
          })
          .end()
      );
    },

    "Submits are enabled"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".js-report-buttons"
        )
          // pick a valid file type
          .findByCssSelector("#image")
          .type(VALID_IMAGE_PATH)
          .end()
          .findByCssSelector("#url")
          .type("http://coolguy.biz")
          .end()
          // pick a problem type
          .findByCssSelector("[for=problem_category-0]")
          .click()
          .end()
          .findByCssSelector("#description")
          .type("test for desktop site")
          //.click()
          .end()
          // wait a bit
          .sleep(250)
          // now make sure the buttons aren't disabled anymore
          .findAllByCssSelector("#js-ReportForm .js-Button")
          .getAttribute("disabled")
          .then(function(values) {
            values.forEach(function(value) {
              assert.isNull(value);
            });
          })
          .end()
      );
    },

    "problem_type param selects problem type"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new?problem_type=video_bug"),
        ".js-report-buttons"
      )
        .findByCssSelector("[value=video_bug]")
        .isSelected()
        .then(function(isSelected) {
          assert.isTrue(isSelected, "The right option is selected");
        })
        .end();
    },

    "details param doesn't add info to description"() {
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
            "gfx.webrender.all",
            "details param is added after reporting (legacy or not)"
          );
        });
    },

    "GitHub contact name with a leading @"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-report-buttons"
      )
        .findByCssSelector("#contact")
        .click()
        .type("@webcompat-bot")
        .end()
        .sleep(500)
        .findByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "GitHub nicknames are 39",
            "contact validation message is shown"
          );
        })
        .end();
    },

    "Mixed and lowercase GitHub usernames are valid"() {
      return (
        FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".js-report-buttons"
        )
          .findByCssSelector("#contact")
          .click()
          .type("WebCompat-Bot")
          .end()
          .sleep(500)
          // make sure we can see the valid checkbox (i.e. it's background image is non-empty)
          .execute(function() {
            return window
              .getComputedStyle(
                document.querySelector(".js-bug-form-contact"),
                ":after"
              )
              .getPropertyValue("background-image");
          })
          .then(function(bgImage) {
            assert.include(
              bgImage,
              "checkmark.svg",
              "The valid checkbox pseudo is visible"
            );
          })
          .end()
          .findByCssSelector("#contact")
          .click()
          .type("webcompat-bot")
          .end()
          .sleep(500)
          // make sure we can see the valid checkbox (i.e. it's background image is non-empty)
          .execute(function() {
            return window
              .getComputedStyle(
                document.querySelector(".js-bug-form-contact"),
                ":after"
              )
              .getPropertyValue("background-image");
          })
          .then(function(bgImage) {
            assert.include(
              bgImage,
              "checkmark.svg",
              "The valid checkbox pseudo is visible"
            );
          })
          .end()
      );
    },

    "GitHub contact name with two consecutives --"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-report-buttons"
      )
        .findByCssSelector("#contact")
        .click()
        .type("wrong--name")
        .end()
        .sleep(500)
        .findByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "GitHub nicknames are 39",
            "contact validation message is shown"
          );
        })
        .end();
    },

    "GitHub contact name too long"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-report-buttons"
      )
        .findByCssSelector("#contact")
        .click()
        .type("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        .end()
        .sleep(500)
        .findByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "GitHub nicknames are 39",
            "contact validation message is shown"
          );
        })
        .end();
    },
    "Submitting form without filling anything"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-report-buttons"
      )
        .findByCssSelector(".js-Button-wrapper")
        .click()
        .end()
        .sleep(500)
        .findAllByCssSelector(".form-message-error")
        .getVisibleText()
        .then(function(texts) {
          var errorTexts = [
            "A valid URL is required.",
            "Problem type required.",
            "A problem summary is required."
          ];
          errorTexts.forEach(function(expectedText) {
            assert.include(texts, expectedText, "Error messages don't match");
          });
        })
        .end();
    }
  }
});
