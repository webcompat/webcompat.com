/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  "intern",
  "intern!object",
  "intern/chai!assert",
  "require",
  "tests/functional/lib/helpers",
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  "use strict";

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: "Contributors",

    "page loads": function() {
      return FunctionalHelpers.openPage(this, url("/contributors"), ".wc-Hero--contributors")
        .findByCssSelector(".js-Hero-title").getVisibleText()
        .then(function(text) {
          assert.include(text, "Welcome aboard!");
        })
        .end();
    },

    "clicking first section closes it": function() {
      return FunctionalHelpers.openPage(this, url("/contributors"), ".wc-Hero--contributors")
        .findByCssSelector(".contributors__item__title").click()
        .end()
        .findByCssSelector(".contributors__item__content").getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-open", className);
        })
        .end()
        .findByCssSelector(".js-Hero-svg").getAttribute("class")
        .then(function(className) {
          assert.notEqual("is-active", className);
        })
        .end();
    },

    "clicking section toggles it": function() {
      return FunctionalHelpers.openPage(this, url("/contributors"), ".wc-Hero--contributors")
        .findByCssSelector(".contributors__item__content.is-open").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        .findByCssSelector(".js-Hero-svg.is-active").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        .findByCssSelector(".contributors__item__title").click()
        .end()
        .findByCssSelector(".contributors__item__content").getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-open", className);
        })
        .end()
        .findByCssSelector(".js-Hero-svg").getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-active", className);
        });
    },

    "toggling section toggles lightbulb": function() {
      return FunctionalHelpers.openPage(this, url("/contributors"), ".wc-Hero--contributors")
        .findByCssSelector(".js-Hero-svg.is-active").isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true);
        })
        .end()
        .findByCssSelector(".contributors__item__title").click()
        .end()
        .findByCssSelector(".js-Hero-svg").getAttribute("class")
        .then(function(className) {
          assert.notInclude("is-active", className);
        });
    },

  });
});
