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
    name: "Issues (auth)",

    setup: function() {
      return FunctionalHelpers.login(this);
    },

    teardown: function() {
      return FunctionalHelpers.logout(this);
    },

    "Closing and reopening an issue": function() {
      return FunctionalHelpers.openPage(this, url("/issues/70"), ".wc-Issue-commentSubmit", true)
        .findDisplayedByCssSelector(".js-Issue-state-button").click()
        .end()
        .sleep(1000)
        .findByCssSelector(".js-Issue-state-button").getVisibleText()
        .then(function(text) {
          assert.equal(text, "Reopen Issue", "Button says Reopen not Close");
        })
        .end()
        .findByCssSelector(".js-Issue-state-button").click()
        .end()
        .sleep(1000)
        .findByCssSelector(".js-Issue-state-button").getVisibleText()
        .then(function(text) {
          assert.equal(text, "Close Issue", "Button says Close not Reopen");
        });
    }

  });
});
