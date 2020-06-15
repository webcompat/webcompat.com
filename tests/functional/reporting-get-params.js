"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

const url =
  intern.config.functionalBaseUrl +
  "issues/new?url=http://example.com/&src=web&details=test&problem_type=site_bug";

registerSuite("Reporting through passing GET params", {
  tests: {
    "Form fields are prefilled"() {
      return FunctionalHelpers.openPage(this, url, "#js-ReportForm")
        .findByCssSelector("#url")
        .getProperty("value")
        .then(function (value) {
          assert.include(value, "http://example.com");
        })
        .end()
        .findByCssSelector("#details")
        .getProperty("value")
        .then(function (value) {
          assert.include(value, "test");
        })
        .end()
        .findByCssSelector("[value='site_bug']")
        .getProperty("checked")
        .then(function (value) {
          assert.equal(value, true);
        })
        .end();
    },
  },
});
