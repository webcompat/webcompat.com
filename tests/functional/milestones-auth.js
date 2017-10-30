/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(
  [
    "intern",
    "intern!object",
    "intern/chai!assert",
    "require",
    "tests/functional/lib/helpers",
    "intern/dojo/node!leadfoot/keys"
  ],
  function(intern, registerSuite, assert, require, FunctionalHelpers, keys) {
    "use strict";
    registerSuite(function() {
      var url = function(path) {
        return intern.config.siteRoot + path;
      };

      return {
        name: "Milestones (auth)",

        setup: function() {
          return FunctionalHelpers.login(this);
        },

        teardown: function() {
          return FunctionalHelpers.logout(this);
        },

        "Milestone editor opens then closes (clicks)": function() {
          return FunctionalHelpers.openPage(
            this,
            url("/issues/2"),
            ".js-MilestoneEditorLauncher",
            true /* longerTimeout */
          )
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .click()
            .end()
            .findByCssSelector(".js-CategoryEditor")
            .end()
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .click()
            .getAttribute("class")
            .then(function(className) {
              assert.notInclude("is-active", className);
            })
            .end();
        },

        "Milestone editor opens then closes (key events)": function() {
          return FunctionalHelpers.openPage(
            this,
            url("/issues/2"),
            ".js-MilestoneEditorLauncher",
            true /* longerTimeout */
          )
            .findByCssSelector("body")
            .type("m")
            .end()
            .findByCssSelector(".wc-CategoryEditor-search")
            .type(keys.ESCAPE)
            .end()
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .click()
            .getAttribute("class")
            .then(function(className) {
              assert.notInclude("is-active", className);
            })
            .end();
        },

        "Clicking outside milestone editor closes it": function() {
          return FunctionalHelpers.openPage(
            this,
            url("/issues/2"),
            ".js-MilestoneEditorLauncher",
            true /* longerTimeout */
          )
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .click()
            .end()
            .findByCssSelector(".js-CategoryEditor")
            .end()
            .findByCssSelector("main")
            .click()
            .end()
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .getAttribute("class")
            .then(function(className) {
              assert.notInclude("is-active", className);
            })
            .end();
        },

        "Clicking close button actually closes it?": function() {
          return FunctionalHelpers.openPage(
            this,
            url("/issues/2"),
            ".js-MilestoneEditorLauncher",
            true /* longerTimeout */
          )
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .click()
            .end()
            .findByCssSelector(".js-CategoryEditor-close")
            .click()
            .end()
            .findByCssSelector(".js-MilestoneEditorLauncher")
            .getAttribute("class")
            .then(function(className) {
              assert.notInclude("is-active", className);
            })
            .end();
        }
      };
    });
  }
);
