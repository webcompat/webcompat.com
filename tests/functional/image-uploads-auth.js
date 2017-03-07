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
    name: "Image Uploads (auth)",

    setup: function() {
      return FunctionalHelpers.login(this);
    },

    teardown: function() {
      return FunctionalHelpers.logout(this);
    },

    "add a screenshot to a comment": function() {
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".wc-Comment-body")
        .findById("image")
        .type("tests/fixtures/green_square.jpg")
        .sleep(1000)
        .end()
        .findByCssSelector(".js-Comment-text").getProperty("value")
        .then(function(val) {
          assert.include(val, "![Screenshot of the site issue](http://localhost:5000/uploads/", "The image was correctly uploaded and its URL was copied to the comment text.");
        })
        .end();
    }
  });
});
