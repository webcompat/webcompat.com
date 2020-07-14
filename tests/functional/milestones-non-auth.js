"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = function (path) {
  return intern.config.functionalBaseUrl + path;
};

registerSuite("Milestones (non-auth)", {
  tests: {
    "Page loads without milestone set": function () {
      return FunctionalHelpers.openPage(
        this,
        url("issues/9"),
        ".js-Issue",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-issue-title")
        .getVisibleText()
        .then(function (text) {
          // check that the title loaded, it won't be there if the page didn't render.
          assert.include(text, "No Milestone.");
        })
        .end();
    },

    "Missing status error displays": function () {
      FunctionalHelpers.openPage(
        this,
        url("issues/9"),
        ".js-Issue",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-Milestone")
        .getVisibleText();

      return FunctionalHelpers.openPage(
        this,
        url("issues/9"),
        ".js-Issue",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-Milestone")
        .getVisibleText()
        .then(function (text) {
          // check that the title loaded, it won't be there if the page didn't render.
          assert.equal(text, "No status assigned yet");
        })
        .end();
    },
  },
});
