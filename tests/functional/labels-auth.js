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
        name: "Labels (auth)",

        setup: function() {
          return FunctionalHelpers.login(this);
        },

        teardown: function() {
          return FunctionalHelpers.logout(this);
        },

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
            .findByCssSelector(".js-LabelEditor")
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
            .findByCssSelector(".wc-LabelEditor-search")
            .type(keys.ESCAPE)
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
            .findByCssSelector(".js-LabelEditor")
            .end()
            .findByCssSelector("main")
            .click()
            .end()
            .findByCssSelector(".js-LabelEditorLauncher")
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
