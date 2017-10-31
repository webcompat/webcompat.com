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
    registerSuite(function() {
      var url = function(path) {
        return intern.config.siteRoot + path;
      };

      return {
        name: "Milestones (non-auth)",

        "Page loads without milestone set": function() {
          return FunctionalHelpers.openPage(
            this,
            url("/issues/9"),
            ".js-Issue",
            true /* longerTimeout */
          )
            .findByCssSelector(".js-Issue-title")
            .getVisibleText()
            .then(function(text) {
              // check that the title loaded, it won't be there if the page didn't render.
              assert.include(text, "No Milestone.");
            })
            .end();
        },

        "Missing status error displays": function() {
          return FunctionalHelpers.openPage(
            this,
            url("/issues/9"),
            ".js-Issue",
            true /* longerTimeout */
          )
            .findByCssSelector(".js-Milestone")
            .getVisibleText()
            .then(function(text) {
              // check that the title loaded, it won't be there if the page didn't render.
              assert.equal(text, "Error: no status for this issue");
            })
            .end();
        }
      };
    });
  }
);
