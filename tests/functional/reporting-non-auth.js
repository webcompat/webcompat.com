/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(
  [
    "intern",
    "intern!object",
    "intern/chai!assert",
    "intern/browser_modules/dojo/node!path",
    "tests/functional/lib/helpers"
  ],
  function(intern, registerSuite, assert, path, FunctionalHelpers) {
    "use strict";
    var cwd = intern.config.basePath;
    var VALID_IMAGE_PATH = path.join(cwd, "tests/fixtures", "green_square.png");
    var BAD_IMAGE_PATH = path.join(cwd, "tests/fixtures", "evil.py");
    var DETAILS_STRING =
      "Encountered error: NS_ERROR_DOM_MEDIA_DEMUXER_ERR (0x806e000c)%0ALocation: virtual%0ARefPtrMP4Demuxer::InitPromise mozilla::MP4Demuxer::Init()%0AError information:%0AIncomplete MP4 metadata%0AMedia URL: file:///Users/potch/Documents/mozilla/media.mp4";
    var DETAILS_STRING2 = "Encountered+error:+NS_ERROR_DOM_MEDIA_DEMUXER_ERR";

    var url = function(path) {
      return intern.config.siteRoot + path;
    };

    registerSuite({
      name: "Reporting (non-auth)",

      "Submit buttons are disabled": function() {
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

      "Wyciwyg bug workaround": function() {
        return FunctionalHelpers.openPage(
          this,
          url(
            "/issues/new?url=wyciwyg://0/http://bbs.csdn.net/topics/20282413"
          ),
          "#url"
        )
          .findByCssSelector("#url")
          .getProperty("value")
          .then(function(value) {
            assert.notInclude(value, "wyciwyg://0/");
          })
          .end();
      },

      "Report button shows via GitHub": function() {
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

      "URL validation": function() {
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
          .findByCssSelector(".wc-Form-helpMessage")
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
          .waitForDeletedByCssSelector(".wc-Form-helpMessage")
          .end();
      },

      "Description validation": function() {
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
            .findByCssSelector(".wc-Form-helpMessage")
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
            .waitForDeletedByCssSelector(".wc-Form-helpMessage")
            .end()
        );
      },

      "(optional) browser + os validation": function() {
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

      "Image extension validation": function() {
        return (
          FunctionalHelpers.openPage(
            this,
            url("/issues/new"),
            ".wc-ReportForm-actions-button"
          )
            .findByCssSelector("#image")
            .type(BAD_IMAGE_PATH)
            .end()
            .findByCssSelector(".wc-Form-helpMessage--imageUpload")
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
            .waitForDeletedByCssSelector(".wc-Form-helpMessage--imageUpload")
            .end()
        );
      },

      "Submits are enabled": function() {
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

      // tests a scenario where bug reported from firefox nightly media type tool
      "problem_type param selects problem type": function() {
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

      "details param adds info to description": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/new?details=" + DETAILS_STRING),
          "#description"
        )
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function(text) {
            assert.include(
              text,
              "Encountered error: NS_ERROR_DOM_MEDIA_DEMUXER_ERR (0x806e000c)\nLocation: virtual\nRefPtrMP4Demuxer::InitPromise mozilla::MP4Demuxer::Init()\nError information:\nIncomplete MP4 metadata\nMedia URL: file:///Users/potch/Documents/mozilla/media.mp4"
            );
          })
          .end();
      },

      "details param: + decoded as space": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/new?details=" + DETAILS_STRING2),
          "#description"
        )
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function(text) {
            assert.notInclude(
              text,
              "Encountered+error:+NS_ERROR_DOM_MEDIA_DEMUXER_ERR",
              "+ not found in decoded string"
            );
            assert.include(
              text,
              "Encountered error: NS_ERROR_DOM_MEDIA_DEMUXER_ERR",
              "+ replaced with space"
            );
          })
          .end();
      }
    });
  }
);
