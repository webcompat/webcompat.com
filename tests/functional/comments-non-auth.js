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
    name: "Comments (non-auth)",

    "Comment form not visible for logged out users": function() {
      return FunctionalHelpers.openPage(this, url("/issues/200"), ".js-Issue")
        .findByCssSelector(".js-Comment-form")
        .then(assert.fail, function(err) {
          assert.isTrue(/NoSuchElement/.test(String(err)));
        })
        .end();
    }

  });
});
