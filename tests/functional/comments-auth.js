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
      name: "Comments (auth)",

      setup: function() {
        return FunctionalHelpers.login(this);
      },

      teardown: function() {
        return FunctionalHelpers.logout(this);
      },

      "Comments form visible when logged in": function() {
        return (
          FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
            // Comment form visible for logged in users.
            .findDisplayedByCssSelector(".js-Comment-form")
            .end()
        );
      },

      "Posting a comment": function() {
        var originalCommentsLength;
        var allCommentsLength;
        return (
          FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
            .findAllByCssSelector(".js-Issue-comment")
            .then(function(elms) {
              originalCommentsLength = elms.length;
            })
            .end()
            .findByCssSelector("textarea.js-Comment-text")
            .type("Today's date is " + new Date().toDateString())
            .end()
            // click the comment button
            .findByCssSelector(".js-Issue-comment-button")
            .click()
            .end()
            .sleep(1000)
            .findAllByCssSelector(".js-Issue-comment")
            .then(function(elms) {
              allCommentsLength = elms.length;
              assert(
                originalCommentsLength < allCommentsLength,
                "Comment was successfully left."
              );
            })
        );
      },

      "Posting an empty comment fails": function() {
        var originalCommentsLength;
        var allCommentsLength;
        return (
          FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
            .findAllByCssSelector(".js-Issue-comment")
            .then(function(elms) {
              originalCommentsLength = elms.length;
            })
            .end()
            // click the comment button
            .execute(function() {
              // workaround for Chrome bug
              // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1852
              document
                .querySelector(".js-Issue-comment-button")
                .scrollIntoView();
            })
            .findByCssSelector(".js-Issue-comment-button")
            .click()
            .end()
            .sleep(2000)
            .findAllByCssSelector(".js-Issue-comment")
            .then(function(elms) {
              allCommentsLength = elms.length;
              assert(
                originalCommentsLength === allCommentsLength,
                "Comment was not successfully left."
              );
            })
        );
      },

      "Add a screenshot to a comment": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/100"),
          ".wc-Comment-body"
        )
          .findById("image")
          .type("tests/fixtures/green_square.png")
          .end()
          .sleep(2000)
          .findByCssSelector(".js-Comment-text")
          .getProperty("value")
          .then(function(val) {
            assert.include(
              val,
              "[![Screenshot Description](http://localhost:5000/uploads/",
              "The image was correctly uploaded and its URL was copied to the comment text."
            );
          })
          .end();
      },

      "Pressing 'g' inside of comment textarea *doesn't* go to github issue": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/100"),
          ".wc-Comment-submit"
        )
          .execute(function() {
            // workaround for Chrome bug
            // https://bugs.chromium.org/p/chromedriver/issues/detail?id=1852
            document.querySelector(".wc-Comment-submit").scrollIntoView();
          })
          .findByCssSelector(".wc-Comment-submit")
          .click()
          .type("g")
          .end()
          .setFindTimeout(2000)
          .findByCssSelector(".repo-container .issues-listing")
          .then(assert.fail, function(err) {
            assert.isTrue(/NoSuchElement/.test(String(err)));
          })
          .end();
      },

      "Pressing 'l' inside of comment textarea *doesn't* open the label editor box": function() {
        return FunctionalHelpers.openPage(
          this,
          url("/issues/100"),
          ".wc-Comment-submit"
        )
          .findByCssSelector(".wc-Comment-submit")
          .click()
          .type("l")
          .end()
          .setFindTimeout(2000)
          .findByCssSelector(".js-LabelEditorLauncher")
          .getAttribute("class")
          .then(function(className) {
            assert.notInclude(className, "is-active");
          })
          .end();
      }
    });
  }
);
