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

      setup: async function() {
        await FunctionalHelpers.login(this);
      },

      teardown: async function() {
        await FunctionalHelpers.logout(this);
      },

      "Comments form visible when logged in": async function() {
        await FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue");

        let commentForm = await this.remote.findDisplayedByCssSelector(
          ".js-Comment-form"
        );
        let commentFormVisibility = await commentForm.isDisplayed();
        assert.isOk(commentFormVisibility);
      },

      "Empty vs non-empty comment button text (open issue)": async function() {
        await FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue");

        let button = await this.remote.findDisplayedByCssSelector(
          ".js-Issue-state-button"
        );
        let buttonText = await button.getVisibleText();
        assert.strictEqual("Close Issue", buttonText);

        let textarea = await this.remote.findByCssSelector(
          "textarea.js-Comment-text"
        );
        await textarea.type("test comment");

        let updatedButton = await this.remote.findDisplayedByCssSelector(
          ".js-comment-close-and-comment"
        );
        let updatedButtonText = await updatedButton.getVisibleText();
        assert.strictEqual("Close and comment", updatedButtonText);
      },

      "Empty vs non-empty comment button text (closed issue)": async function() {
        await FunctionalHelpers.openPage(this, url("/issues/101"), ".js-Issue");

        let button = await this.remote.findDisplayedByCssSelector(
          ".js-comment-reopen-issue"
        );
        let buttonText = await button.getVisibleText();
        assert.strictEqual("Reopen Issue", buttonText);

        let textarea = await this.remote.findByCssSelector(
          "textarea.js-Comment-text"
        );
        await textarea.type("test comment");

        let updatedButton = await this.remote.findDisplayedByCssSelector(
          ".js-comment-reopen-and-comment"
        );
        let updatedButtonText = await updatedButton.getVisibleText();
        assert.strictEqual("Reopen and comment", updatedButtonText);
      },

      "Posting a comment": async function() {
        await FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue");

        let originalComments = await this.remote.findAllByCssSelector(
          ".js-Issue-comment"
        );
        let originalCommentsLength = originalComments.length;

        let textarea = await this.remote.findDisplayedByCssSelector(
          "textarea.js-Comment-text"
        );
        await textarea.click();
        await textarea.type("test comment");

        let button = await this.remote.findDisplayedByCssSelector(
          ".js-Issue-comment-button"
        );
        await button.click();

        let updatedComments = await this.remote.findAllByCssSelector(
          ".js-Issue-comment"
        );
        let updatedCommentsLength = updatedComments.length;

        assert.isBelow(
          originalCommentsLength,
          updatedCommentsLength,
          "Comment was successfully left."
        );
      },

      "Posting an empty comment fails": async function() {
        await FunctionalHelpers.openPage(this, url("/issues/100"), ".js-Issue");

        let originalComments = await this.remote.findAllByCssSelector(
          ".js-Issue-comment"
        );
        let originalCommentsLength = originalComments.length;

        let button = await this.remote.findByCssSelector(
          ".js-Issue-comment-button"
        );
        await button.click();

        let updatedComments = await this.remote.findAllByCssSelector(
          ".js-Issue-comment"
        );
        let updatedCommentsLength = updatedComments.length;

        assert.strictEqual(
          originalCommentsLength,
          updatedCommentsLength,
          "Comment was not successfully left."
        );
      },

      "Add a screenshot to a comment": async function() {
        await FunctionalHelpers.openPage(
          this,
          url("/issues/100"),
          ".wc-Comment-body"
        );

        let input = await this.remote.findById("image");
        await input.type(require.toUrl("../fixtures/green_square.png"));

        let textarea = await this.remote.findByCssSelector(".js-Comment-text");
        let text = await textarea.getProperty("value");

        assert.include(
          text,
          "[![Screenshot Description](http://localhost:5000/uploads/",
          "The image was correctly uploaded and its URL was copied to the comment text."
        );
      },

      "Pressing 'g' inside of comment textarea *doesn't* go to github issue": async function() {
        await FunctionalHelpers.openPage(
          this,
          url("/issues/100"),
          ".wc-Comment-submit"
        );

        let textarea = await this.remote.findByCssSelector(
          ".wc-Comment-submit"
        );
        await textarea.click();
        await textarea.type("g");

        let currentUrl = await this.remote.getCurrentUrl();

        assert.notInclude("github.com", currentUrl);
      },

      "Pressing 'l' inside of comment textarea *doesn't* open the label editor box": async function() {
        await FunctionalHelpers.openPage(
          this,
          url("/issues/100"),
          ".wc-Comment-submit"
        );

        let textarea = await this.remote.findByCssSelector(
          ".wc-Comment-submit"
        );
        await textarea.click();
        await textarea.type("l");

        let labelEditorLauncher = await this.remote.findByCssSelector(
          ".js-LabelEditorLauncher"
        );
        let labelEditorLauncherClasses = await labelEditorLauncher.getAttribute(
          "class"
        );

        assert.notInclude(labelEditorLauncherClasses, "is-active");
      }
    });
  }
);
