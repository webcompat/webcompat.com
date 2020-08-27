"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*global WindowHelpers:true*/
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");
const baseUrl = intern.config.functionalBaseUrl;
const url = baseUrl + "issues/new";
const targetOrigin = baseUrl.slice(0, baseUrl.length - 1);

// This string is executed by calls to `execute()` in various tests
// it postMessages a small green test square.
const POSTMESSAGE_TEST_SQUARE =
  'postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")';

registerSuite("Image Uploads (non-auth)", {
  tests: {
    "postMessaged dataURI preview"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-image-upload")
          // send a small base64 encoded green test square
          .execute(POSTMESSAGE_TEST_SQUARE)
          .sleep(1000)
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function (inlineStyle) {
            assert.include(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "Base64 data shown as preview background"
            );
          })
          .end()
      );
    },
    "postMessaged blob preview"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-image-upload")
          // Build up a green test square in canvas, toBlob that, and then postMessage the blob
          // see window-helpers.js for more details.
          .execute(
            function (args) {
              WindowHelpers.getBlob(args).then(WindowHelpers.sendBlob);
            },
            [targetOrigin]
          )
          .sleep(1000)
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function (inlineStyle) {
            assert.include(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "Base64 data shown as preview background"
            );
          })
          .end()
      );
    },

    "postMessaged blob preview that was sent as part of an object"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-image-upload")
          // Build up a green test square in canvas, toBlob that, and then postMessage the blob
          // see window-helpers.js for more details.
          .execute(function () {
            WindowHelpers.getBlob().then(WindowHelpers.sendBlobInObject);
          })
          .sleep(1000)
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function (inlineStyle) {
            assert.include(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "Base64 data shown as preview background"
            );
          })
          .end()
      );
    },

    "uploaded image file preview"() {
      return FunctionalHelpers.openPage(this, url, ".js-image-upload")
        .findById("image")
        .type("tests/fixtures/green_square.png")
        .end()
        .sleep(1000)
        .findByCssSelector(".js-image-upload")
        .getAttribute("style")
        .then(function (inlineStyle) {
          assert.include(
            inlineStyle,
            "data:image/png;base64,iVBOR",
            "Base64 data shown as preview background"
          );
        })
        .end();
    },

    "postMessaged dataURI image doesn't upload before form submission"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-image-upload")
          // send a small base64 encoded green test square
          .execute(POSTMESSAGE_TEST_SQUARE)
          .sleep(1000)
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function (val) {
            assert.notInclude(
              val,
              "<img alt='Screenshot' src='http://localhost:5000/uploads/",
              "The data URI was not uploaded before form submission."
            );
          })
          .end()
      );
    },

    "postMessaged blob image doesn't upload before form submission"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-image-upload")
          // Build up a green test square in canvas, toBlob that, and then postMessage the blob
          .execute(function () {
            WindowHelpers.getBlob().then(WindowHelpers.sendBlob);
          })
          .sleep(1000)
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function (val) {
            assert.notInclude(
              val,
              "<img alt='Screenshot' src='",
              "The data URI was not uploaded before form submission."
            );
          })
          .end()
      );
    },

    "uploaded image file doesn't upload before form submission"() {
      return FunctionalHelpers.openPage(this, url, ".js-image-upload")
        .findById("image")
        .type("tests/fixtures/green_square.png")
        .end()
        .sleep(1000)
        .findByCssSelector("#steps_reproduce")
        .getProperty("value")
        .then(function (val) {
          assert.notInclude(
            val,
            "<img alt='Screenshot' src='",
            "The data URI was not uploaded before form submission."
          );
        })
        .end();
    },

    "clicking remove image upload button removes preview"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-remove-upload")
          // send a small base64 encoded green test square
          .execute(POSTMESSAGE_TEST_SQUARE)
          .sleep(1000)
          .execute(() => {
            // work around for chrome "Other element would receive the click"
            // error
            document.querySelector(".js-remove-upload").click();
          })
          .end()
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function (inlineStyle) {
            assert.notInclude(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "Preview was removed"
            );
          })
          .end()
      );
    },

    "clicking remove image upload button removes image URL"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-remove-upload")
          // send a small base64 encoded green test square
          .execute(POSTMESSAGE_TEST_SQUARE)
          .sleep(1000)
          .execute(() => {
            // work around for chrome "Other element would receive the click"
            // error
            document.querySelector(".js-remove-upload").click();
          })
          .end()
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function (inlineStyle) {
            assert.notInclude(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "Preview was removed"
            );
          })
          .end()
      );
    },

    "double image select works"() {
      return FunctionalHelpers.openPage(this, url, ".js-remove-upload")
        .execute(POSTMESSAGE_TEST_SQUARE)
        .sleep(1000)
        .execute(POSTMESSAGE_TEST_SQUARE)
        .sleep(1000)
        .findByCssSelector(".js-image-upload")
        .getAttribute("style")
        .then(function (inlineStyle) {
          assert.include(
            inlineStyle,
            "data:image/png;base64,iVBOR",
            "Preview is shown"
          );
        })
        .end();
    },
  },
});
