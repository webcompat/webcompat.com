"use strict";
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const intern = require("intern").default;
const { assert } = intern.getPlugin("chai");
const { registerSuite } = intern.getInterface("object");
const FunctionalHelpers = require("./lib/helpers.js");

var url = path => intern.config.siteRoot + path;

registerSuite("Comments (auth)", {
  before() {
    return FunctionalHelpers.login(this);
  },

  after() {
    return FunctionalHelpers.logout(this);
  },

  tests: {
    "Comments form visible when logged in"() {
      return (
        FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
          // Comment form visible for logged in users.
          .findDisplayedByCssSelector(".js-Comment-form")
          .end()
      );
    },

    "Comments form not visible when the issue is locked"() {
      return (
        FunctionalHelpers.openPage(this, url("/issues/23"), ".js-Issue")
          // Comment form should not be visible for locked issues.
          .findByCssSelector(".js-issue-comment-submit")
          .getAttribute("class")
          .then(className => {
            assert.include(className, "is-hidden");
          })
          .end()
      );
    },

    "Posting a comment"() {
      var originalCommentsLength;
      var allCommentsLength;
      return (
        FunctionalHelpers.openPage(this, url("/issues/100"), ".js-image-upload")
          .findAllByCssSelector(".js-Issue-comment")
          .then(elms => {
            originalCommentsLength = elms.length;
          })
          .end()
          .findByCssSelector("textarea")
          .type("Today's date is " + new Date().toDateString())
          .end()
          // click the comment button
          .findByCssSelector(".js-Issue-comment-button")
          .click()
          .end()
          .sleep(1000)
          .findAllByCssSelector(".js-Issue-comment")
          .then(elms => {
            allCommentsLength = elms.length;
            assert(
              originalCommentsLength < allCommentsLength,
              "Comment was successfully left."
            );
          })
      );
    },

    "Posting an empty comment fails"() {
      var originalCommentsLength;
      var allCommentsLength;
      return FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue")
        .findAllByCssSelector(".js-Issue-comment")
        .then(elms => {
          originalCommentsLength = elms.length;
        })
        .end()
        .execute(() => {
          // click the comment button
          $(".js-Issue-comment-button")[0].click();
        })
        .end()
        .sleep(2000)
        .findAllByCssSelector(".js-Issue-comment")
        .then(elms => {
          allCommentsLength = elms.length;
          assert(
            originalCommentsLength === allCommentsLength,
            "Comment was not successfully left."
          );
        });
    },

    "Pressing 'g' inside of comment textarea *doesn't* go to github issue"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/100"),
        ".js-Comment-text"
      )
        .findByCssSelector(".js-Comment-text")
        .type("g")
        .end()
        .setFindTimeout(2000)
        .findByCssSelector(".repo-container .issues-listing")
        .then(assert.fail, err => {
          assert.isTrue(/NoSuchElement/.test(String(err)));
        })
        .end();
    },

    "Pressing 'l' inside of comment textarea *doesn't* open the label editor box"() {
      return FunctionalHelpers.openPage(
        this,
        url("/issues/100"),
        ".js-Comment-text"
      )
        .findByCssSelector(".js-Comment-text")
        .type("l")
        .end()
        .setFindTimeout(2000)
        .findByCssSelector(".js-LabelEditorLauncher")
        .getAttribute("class")
        .then(className => {
          assert.notInclude(className, "is-active");
        })
        .end();
    }
  }
});
