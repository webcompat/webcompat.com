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

      "Empty vs non-empty comment button text (open issue)": function() {
        return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
          .findDisplayedByCssSelector(".js-Issue-state-button")
          .getVisibleText()
          .then(function(text) {
            assert.equal("Close Issue", text);
            assert.notEqual("Close and comment", text);
          })
          .end()
          .findByCssSelector("textarea.js-Comment-text")
          .type("test comment")
          .end()
          .findDisplayedByCssSelector(".js-comment-close-and-comment")
          .getVisibleText()
          .then(function(text) {
            assert.equal("Close and comment", text);
            assert.notEqual("Close Issue", text);
          });
      },

      "Empty vs non-empty comment button text (closed issue)": function() {
        return FunctionalHelpers.openPage(this, url("/issues/101"), ".js-Issue")
          .findDisplayedByCssSelector(".js-comment-reopen-issue")
          .getVisibleText()
          .then(function(text) {
            assert.equal("Reopen Issue", text);
            assert.notEqual("Reopen and comment", text);
          })
          .end()
          .findByCssSelector("textarea.js-Comment-text")
          .type("test comment")
          .end()
          .findDisplayedByCssSelector(".js-comment-reopen-and-comment")
          .getVisibleText()
          .then(function(text) {
            assert.equal("Reopen and comment", text);
            assert.notEqual("Reopen Issue", text);
          });
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
            .findDisplayedByCssSelector(".js-comment-close-and-comment")
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
          .type(require.toUrl("../fixtures/green_square.png"))
          .sleep(1000)
          .end()
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
