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

registerSuite("New Issue Page", {
  tests: {
    "new issue page loads"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-Navbar-link"
      )
        .findByCssSelector(".js-Navbar-link")
        .getVisibleText()
        .then(function(text) {
          assert.equal(text, "Home");
          assert.notInclude(text, "Download our");
        })
        .end();
    }
  }
});
