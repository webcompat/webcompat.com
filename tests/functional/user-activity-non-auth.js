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

registerSuite("User Activity (non-auth)", {
  tests: {
    "Trying to view someone else's activity fails (logged out)"() {
      return FunctionalHelpers.openPage(
        this,
        url("/activity/someoneelse"),
        ".wc-UIContent"
      )
        .findByCssSelector(".wc-UIContent .wc-Title--l")
        .getVisibleText()
        .then(function(text) {
          assert.include(
            text,
            "Unauthorized. Please log in",
            "User is told to log in."
          );
        });
    }
  }
});
