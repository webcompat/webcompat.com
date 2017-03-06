/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global WindowHelpers:true*/

define([
  "intern",
  "intern!object",
  "intern/chai!assert",
  "require",
  "tests/functional/lib/helpers",
  "intern/browser_modules/dojo/node!path"
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  "use strict";

  var url = intern.config.siteRoot + "/?open=1";

  registerSuite({
    name: "Image Uploads (non-auth)",

    "postMessaged dataURI preview": function() {
      return FunctionalHelpers.openPage(this, url, ".js-image-upload-label")
        // send a small base64 encoded green test square
        .execute("postMessage(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC\", \"http://localhost:5000\")")
        .sleep(1000)
        .findByCssSelector(".js-image-upload-label").getAttribute("style")
        .then(function(inlineStyle) {
          assert.include(inlineStyle, "data:image/png;base64,iVBOR", "Base64 data shown as preview background");
        })
        .end();
    },

    "postMessaged blob preview": function() {
      return FunctionalHelpers.openPage(this, url, ".js-image-upload-label")
        // Build up a green test square in canvas, toBlob that, and then postMessage the blob
        // see window-helpers.js for more details.
        .execute(function() {
          WindowHelpers.getBlob().then(WindowHelpers.sendBlob);
        })
        .sleep(1000)
        .findByCssSelector(".js-image-upload-label").getAttribute("style")
        .then(function(inlineStyle) {
          assert.include(inlineStyle, "data:image/png;base64,iVBOR", "Base64 data shown as preview background");
        })
        .end();
    },

    "postMessaged dataURI image upload worked": function() {
      return FunctionalHelpers.openPage(this, url, ".js-image-upload-label")
        // send a small base64 encoded green test square
        .execute("postMessage(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC\", \"http://localhost:5000\")")
        .sleep(1000)
        .findByCssSelector("#description").getProperty("value")
        .then(function(val) {
          assert.include(val, "![Screenshot Description](http://localhost:5000/uploads/", "The data URI was correctly uploaded and its URL was copied to the bug description.");
        })
        .end();
    },

    "postMessaged blob image upload worked": function() {
      return FunctionalHelpers.openPage(this, url, ".js-image-upload-label")
        // Build up a green test square in canvas, toBlob that, and then postMessage the blob
        .execute(function() {
          WindowHelpers.getBlob().then(WindowHelpers.sendBlob);
        })
        .sleep(1000)
        .findByCssSelector("#description").getProperty("value")
        .then(function(val) {
          assert.include(val, "![Screenshot Description](http://localhost:5000/uploads/", "The data URI was correctly uploaded and its URL was copied to the bug description.");
        })
        .end();
    },

    "remove image upload button": function() {
      return FunctionalHelpers.openPage(this, url, ".wc-UploadForm-button")
        // send a small base64 encoded green test square
        .execute("postMessage(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC\", \"http://localhost:5000\")")
        .sleep(1000)
        .findByCssSelector(".js-image-upload-label .wc-UploadForm-button").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, "Remove button is displayed");
        })
        .end()
        .findByCssSelector(".js-image-upload-label .wc-UploadForm-button").click()
        .sleep(1000)
        .end()
        .findByCssSelector(".js-image-upload-label").getAttribute("style")
        .then(function(inlineStyle) {
          assert.notInclude(inlineStyle, "data:image/png;base64,iVBOR", "Preview was removed");
        })
        .end()
        .findByCssSelector("#description").getProperty("value")
        .then(function(val) {
          assert.notInclude(val, "![Screenshot Description](http://localhost:5000/uploads/", "The url to the image upload was correctly removed.");
        })
        .end();
    }
  });
});
