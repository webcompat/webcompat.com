"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function(path) {
  return intern.config.siteRoot + path;
};

registerSuite("Console logs page", {
  tests: {
    "console log page loads with right data"() {
      return FunctionalHelpers.openPage(
        this,
        url("/console_logs/2019/12/77d565bd-f1b4-4e76-a480-357f72df80b2"),
        "#console_logs_data"
      )
        .findByCssSelector("#console_logs_data")
        .getAttribute("data-file-id")
        .then(function(text) {
          assert.include(text, "7d565bd-f1b4-4e76-a480-357f72df80b2");
        })
        .getAttribute("data-subpath")
        .then(function(text) {
          assert.include(text, "2019/12");
        })
        .end()
        .findByCssSelector(".level-log > .log-message")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "test log");
        })
        .end()
        .findByCssSelector(".level-log > .log-file")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "vendor.js:95:13");
        })
        .end()
        .findByCssSelector(".level-warn > .log-file")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "http://example.com/:1:28535");
        })
        .end()
        .findByCssSelector(".level-error > .log-file")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "test.js:1:1");
        })
        .end();
    }
  }
});
