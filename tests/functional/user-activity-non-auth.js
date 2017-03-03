/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  "intern",
  "intern!object",
  "intern/chai!assert",
  "require",
  "tests/functional/lib/helpers"
], function(intern, registerSuite, assert, require, FunctionalHelpers) {
  "use strict";

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: "User Activity (non-auth)",

    "Trying to view someone else's activity fails (logged out)": function() {
      return FunctionalHelpers.openPage(this, url("/activity/someoneelse"), ".wc-UIContent")
        .findByCssSelector(".wc-UIContent .wc-Title--l").getVisibleText()
        .then(function(text) {
          assert.include(text, "Unauthorized. Please log in", "User is told to log in.");
        });
    }
  });
});
