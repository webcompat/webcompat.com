"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*global WindowHelpers:true*/
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = intern.config.siteRoot + "/?open=1";

registerSuite("Image Uploads (non-auth)", {
  tests: {
    "postMessaged dataURI preview"() {
      return (
        FunctionalHelpers.openPage(this, url, ".js-image-upload")
          // send a small base64 encoded green test square
          .execute(
            'postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")'
          )
          .sleep(1000)
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function(inlineStyle) {
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
          .execute(function() {
            WindowHelpers.getBlob().then(WindowHelpers.sendBlob);
          })
          .sleep(1000)
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function(inlineStyle) {
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
        .sleep(1000)
        .end()
        .findByCssSelector(".js-image-upload")
        .getAttribute("style")
        .then(function(inlineStyle) {
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
          .execute(
            'postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")'
          )
          .sleep(1000)
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function(val) {
            assert.notInclude(
              val,
              "[![Screenshot Description](http://localhost:5000/uploads/",
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
          .execute(function() {
            WindowHelpers.getBlob().then(WindowHelpers.sendBlob);
          })
          .sleep(1000)
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function(val) {
            assert.notInclude(
              val,
              "[![Screenshot Description](http://localhost:5000/uploads/",
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
        .sleep(1000)
        .end()
        .findByCssSelector("#steps_reproduce")
        .getProperty("value")
        .then(function(val) {
          assert.notInclude(
            val,
            "[![Screenshot Description](http://localhost:5000/uploads/",
            "The data URI was not uploaded before form submission."
          );
        })
        .end();
    },

    "remove image upload button"() {
      return (
        FunctionalHelpers.openPage(this, url, ".remove-upload")
          // send a small base64 encoded green test square
          .execute(
            'postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")'
          )
          .sleep(1000)
          .findByCssSelector(".js-image-upload .remove-upload")
          .isDisplayed()
          .then(function(isDisplayed) {
            assert.equal(isDisplayed, true, "Remove button is displayed");
          })
          .end()
          .findByCssSelector(".js-image-upload .remove-upload")
          .click()
          .sleep(1000)
          .end()
          .findByCssSelector(".js-image-upload")
          .getAttribute("style")
          .then(function(inlineStyle) {
            assert.notInclude(
              inlineStyle,
              "data:image/png;base64,iVBOR",
              "Preview was removed"
            );
          })
          .end()
          .findByCssSelector("#steps_reproduce")
          .getProperty("value")
          .then(function(val) {
            assert.notInclude(
              val,
              "[![Screenshot Description](http://localhost:5000/uploads/",
              "The url to the image upload was correctly removed."
            );
          })
          .end()
      );
    },

    "double image select works"() {
      return FunctionalHelpers.openPage(this, url, ".remove-upload")
        .findById("image")
        .type("tests/fixtures/green_square.png")
        .sleep(1000)
        .end()
        .findByCssSelector(".js-image-upload .remove-upload")
        .click()
        .sleep(1000)
        .end()
        .findById("image")
        .type("tests/fixtures/green_square.png")
        .end()
        .sleep(1000)
        .findByCssSelector(".js-image-upload")
        .getAttribute("style")
        .then(function(inlineStyle) {
          assert.include(
            inlineStyle,
            "data:image/png;base64,iVBOR",
            "Preview is shown"
          );
        })
        .end();
    }
  }
});
