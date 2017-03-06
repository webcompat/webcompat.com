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
    name: "History navigation",

    "Back button works from issues page": function() {
      return FunctionalHelpers.openPage(this, url("/"), ".js-issues-link")
        .findByCssSelector(".js-issues-link").click()
        .end()
        // check that the page is loaded
        .findDisplayedByCssSelector(".wc-IssueList:nth-child(11)")
        .end()
        .getCurrentUrl()
        .then(function(url) {
          assert.include(url, "/issues");
        })
        .goBack()
        // now check that we're back at the home page.
        .findDisplayedByCssSelector(".wc-IssueList:nth-child(1)")
        .end()
        .getCurrentUrl()
        .then(function(url) {
          assert.notInclude(url, "/issues");
        })
        .end();
    }
  });
});
