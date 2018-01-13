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

registerSuite("Reporting (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Report button shows name"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/new"),
        ".js-Navbar-link"
      )
        .findByCssSelector("#submitgithub")
        .getVisibleText()
        .then(function(text) {
          assert.include(text, "Report as"); //Report as FooUser (logged in)
        })
        .end();
    }
  }
});
