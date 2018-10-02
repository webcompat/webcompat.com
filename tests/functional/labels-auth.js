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

registerSuite("Labels (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Label editor opens then closes (clicks)": function() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/2"),
        ".js-LabelEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-LabelEditorLauncher")
        .click()
        .end()
        .findByCssSelector(".js-CategoryEditor")
        .end()
        .findByCssSelector(".js-CategoryEditor-close")
        .click()
        .end()
        .findByCssSelector(".js-LabelEditorLauncher")
        .click()
        .getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Label editor opens then closes (key events)": function() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/2"),
        ".js-LabelEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector("body")
        .type("l")
        .end()
        .findByCssSelector(".js-label-search")
        .pressKeys("\uE00C")
        .end()
        .findByCssSelector(".js-LabelEditorLauncher")
        .click()
        .getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Clicking outside label editor closes it": function() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/2"),
        ".js-LabelEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-LabelEditorLauncher")
        .click()
        .end()
        .findByCssSelector(".js-CategoryEditor")
        .end()
        .findByCssSelector(".navigation")
        .click()
        .end()
        .findByCssSelector(".js-LabelEditorLauncher")
        .getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Clicking close button actually closes it": function() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/2"),
        ".js-LabelEditorLauncher",
        true /* longerTimeout */
      )
        .execute(() => {
          $(".js-LabelEditorLauncher")[0].click();
        })
        .findByCssSelector(".js-CategoryEditor-close")
        .click()
        .end()
        .findByCssSelector(".js-LabelEditorLauncher")
        .getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-active", className);
        })
        .end();
    },

    "Label editor filters label list based on entered text": function() {
      var count = 0;
      return FunctionalHelpers.openPage(
        this,
        url("/issues/100"),
        ".js-LabelEditorLauncher",
        true /* longerTimeout */
      )
        .findByCssSelector(".js-LabelEditorLauncher")
        .click()
        .end()
        .findByCssSelector(".js-label-search")
        .type("tacos")
        .end()
        .sleep(1000)
        .findAllByXpath(
          '//label[contains (@class, "label-editor-list-item") and not(@style="display: none;")]'
        )
        .then(function(elements) {
          count = elements.length;
          assert.deepEqual(
            1,
            count,
            "Entering label name in search box filters to matching label"
          );
        })
        .end();
    }
  }
});
