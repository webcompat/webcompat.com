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
      name: "Issues (auth)",

      setup: function() {
        return FunctionalHelpers.login(this);
      },

      teardown: function() {
        return FunctionalHelpers.logout(this);
      },

      "Pressing 'l' opens the label editor box": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/70"),
          ".wc-Issue-commentSubmit"
        )
          .pressKeys("l")
          .end()
          .findByCssSelector(".js-LabelEditorLauncher")
          .then(function(element) {
            element.getAttribute("class").then(function(classList) {
              assert.include(classList, "is-active");
            });
          })
          .end();
      }
    });
  }
);
