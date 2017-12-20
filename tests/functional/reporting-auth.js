/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(
  [
    "intern",
    "intern!object",
    "intern/chai!assert",
    "require",
    "tests/functional/lib/helpers"
  ],
  function(intern, registerSuite, assert, require, FunctionalHelpers) {
    "use strict";
    var url = function(path) {
      return intern.config.siteRoot + path;
    };

    registerSuite({
      name: "Reporting (auth)",

      setup: function() {
        return FunctionalHelpers.login(this);
      },

      teardown: function() {
        return FunctionalHelpers.logout(this);
      },

      "Report button shows name": function() {
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
      },

      "Duplicate issue - buglist shows on focus, hides on blur": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          .findById("url")
          .click()
          .type("https://test.")
          .sleep(500)
          .end()
          .findById("description")
          .click()
          .end()
          .sleep(500)
          .findById("bugList")
          .getVisibleText()
          .then(function(text) {
            assert.equal(text, "");
          });
      },

      "Duplicate issue - 3 issues with url found": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          .findById("url")
          .click()
          .type("https://test.")
          .sleep(500)
          .end()
          .findById("bugList")
          .findAllByCssSelector("li a")
          .getVisibleText()
          .then(function(texts) {
            assert.isAtLeast(texts.length, 3, "found 3 issues");
          })
          .end();
      },

      "Duplicate issue - no issue with url found": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/new"),
          ".wc-ReportForm-actions-button"
        )
          .findById("url")
          .click()
          .type("https://webctest1234567890")
          .sleep(500)
          .end()
          .findById("bugList")
          .findAllByCssSelector("li a")
          .getVisibleText()
          .then(function(texts) {
            assert.equal(texts.length, 0, "No results returned.");
          })
          .end();
      }
    });
  }
);
