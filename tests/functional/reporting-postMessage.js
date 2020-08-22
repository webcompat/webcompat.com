"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

const url = intern.config.functionalBaseUrl + "issues/new";

// This string is executed by calls to `execute()` in various tests
// it postMessages a small green test square.
const POSTMESSAGE_TEST =
  'postMessage({screenshot:{}, message: {"url":"http://example.com","utm_source":"desktop-reporter","utm_campaign":"report-site-issue-button","src":"desktop-reporter","details":{"gfx.webrender.all":false,"gfx.webrender.blob-images":true,"gfx.webrender.enabled":false,"image.mem.shared":true,"buildID":"20191016225400","channel":"default","consoleLog":[],"hasTouchScreen":false,"mixed active content blocked":false,"mixed passive content blocked":false,"tracking content blocked":"false","hasMarfeel":true},"extra_labels":["type-marfeel"]}}, "http://localhost:5000")';

registerSuite("Reporting through postMessage", {
  tests: {
    "postMessaged object"() {
      return (
        FunctionalHelpers.openPage(this, url, "#js-ReportForm")
          // send data object through postMessage
          .execute(POSTMESSAGE_TEST)
          .sleep(1000)
          .getActiveElement()
          .getProperty("id")
          .then(function (elementId) {
            assert.notEqual(elementId, "url", "Focused element id is not #url");
          })
          .end()
          .findByCssSelector("#problem_category")
          .isDisplayed()
          .then(function (isDisplayed) {
            assert.equal(isDisplayed, true, "Category step is visible.");
          })
          .end()
          .findByCssSelector("#url")
          .getProperty("value")
          .then(function (value) {
            assert.include(value, "http://example.com");
          })
          .end()
          .findByCssSelector("#details")
          .getProperty("value")
          .then(function (value) {
            assert.include(value, "gfx.webrender.all");
          })
          .end()
          .findByCssSelector("#reported_with")
          .getProperty("value")
          .then(function (value) {
            assert.include(value, "desktop-reporter");
          })
          .end()
          .findByCssSelector("#extra_labels")
          .getProperty("value")
          .then(function (value) {
            assert.include(value, "type-marfeel");
          })
          .end()
          .findByCssSelector("#desc-url")
          .getAttribute("class")
          .then((className) => {
            assert.notInclude(className, "is-hidden");
          })
          .end()
          .findByCssSelector("#desc-no-url")
          .getAttribute("class")
          .then((className) => {
            assert.include(className, "is-hidden");
          })
          .end()
      );
    },
  },
});
