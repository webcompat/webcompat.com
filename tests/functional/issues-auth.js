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

registerSuite("Issues (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Pressing 'l' opens the label editor box"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/70"),
        ".js-Issue-comment-button"
      )
        .findByCssSelector("body")
        .click()
        .type("l")
        .end()
        .findByCssSelector(".js-LabelEditorLauncher")
        .then(function(element) {
          element
            .getAttribute("class")
            .then(function(classList) {
              assert.include(classList, "is-active");
            })
            .catch(function(error) {
              console.log(error);
            });
        })
        .end();
    }
  }
});
