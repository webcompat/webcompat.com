"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

const url = intern.config.functionalBaseUrl + "issues/new";

registerSuite("Reporting directly", {
  tests: {
    "Ask for url in the description"() {
      return FunctionalHelpers.openPage(this, url, "#js-ReportForm")
        .findByCssSelector("#desc-url")
        .getAttribute("class")
        .then((className) => {
          assert.include(className, "is-hidden");
        })
        .end()
        .findByCssSelector("#desc-no-url")
        .getAttribute("class")
        .then((className) => {
          assert.isNull(className);
        })
        .end();
    },
  },
});
