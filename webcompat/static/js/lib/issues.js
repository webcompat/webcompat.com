/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import Mousetrap from "Mousetrap";
import Prism from "Prism";
import { wcEvents } from "./flash-message.js";
import uploadImageTemplate from "templates/issue/upload-image.jst";
import { Issue } from "./models/issue.js";
import { LabelsView } from "./labels.js";
import { MilestonesView } from "./milestones.js";

var issues = issues || {}; // eslint-disable-line no-use-before-define
issues.events = _.extend({}, Backbone.Events);

issues.AsideView = Backbone.View.extend({
  el: $("#js-Issue-aside"),
  initialize: function () {
    this.model.on(
      "change",
      _.bind(function (model) {
        this.render(model);
      }, this)
    );
  },
  render: function (model) {
    // Update the class of the header here, so the color
    // will be correct when we change milestones from the
    // client.
    if (model.get("state") === "closed") {
      $(".js-milestone-title").text(model.get("issueState"));
      $(".js-state-class")
        .removeClass("label-" + model.previous("milestone"))
        .addClass("label-closed");
    } else if (model.previous("milestone")) {
      $(".js-milestone-title").text(model.get("issueState"));
      $(".js-state-class")
        .removeClass("label-closed")
        .removeClass("label-" + model.previous("milestone"))
        .addClass("label-" + model.get("milestone"));
    }
  },
});

issues.ImageUploadView = Backbone.View.extend({
  el: $(".js-ImageUploadView"),
  events: {
    "change .js-buttonUpload": "validateAndUpload",
  },
  _submitButton: $(".js-Issue-comment-button"),
  _loadingIndicator: $(".js-loader"),
  template: uploadImageTemplate,
  render: function () {
    this.$el.html(this.template()).insertAfter($("textarea"));
    return this;
  },
  inputMap: {
    image: {
      elm: ".js-buttonUpload",
      // image should be valid by default because it's optional
      valid: true,
      helpText:
        "Please select an image of the following type: jpg, png, gif, or bmp.",
    },
  },
  validateAndUpload: function (e) {
    if (this.checkImageTypeValidity(e.target)) {
      // The assumption here is that FormData is supported, otherwise
      // the upload view is not shown to the user.
      var formdata = new FormData($("form").get(0));
      this._loadingIndicator.addClass("is-active");
      $.ajax({
        // File upload will fail if we pass contentType: multipart/form-data
        // to jQuery (because it won't have the boundary string and then all
        // hell breaks loose and you're like 10 stackoverflow posts deep).
        contentType: false,
        processData: false,
        data: formdata,
        method: "POST",
        url: "/upload/",
        success: _.bind(function (response) {
          this.addImageUploadComment(response);
          this._loadingIndicator.removeClass("is-active");
        }, this),
        error: _.bind(function () {
          var msg = "There was an error trying to upload the image.";
          wcEvents.trigger("flash:error", { message: msg, timeout: 4000 });
          this._loadingIndicator.removeClass("is-active");
        }, this),
      });
    }
  },
  addImageUploadComment: function (response) {
    // reponse looks like {filename: "blah", url: "http...blah"}
    var DELIMITER = "\n\n";
    var textarea = $(".js-Comment-text");
    var textareaVal = textarea.val();
    var img_url = response.url;
    var imageURL = [
      "<details><summary>View the screenshot</summary>",
      "<img alt='Screenshot' src='",
      img_url,
      "'></details>",
    ].join("");

    if (!$.trim(textareaVal)) {
      textarea.val(imageURL);
    } else {
      textarea.val(textareaVal + DELIMITER + imageURL);
    }
  },
  // Adapted from bugform.js
  checkImageTypeValidity: function (input) {
    var splitImg = $(input).val().split(".");
    var ext = splitImg[splitImg.length - 1].toLowerCase();
    var allowed = ["jpg", "jpeg", "jpe", "png", "gif", "bmp"];
    if (!_.includes(allowed, ext)) {
      this.makeInvalid("image");
      return false;
    } else {
      this.makeValid("image");
      return true;
    }
  },
  makeInvalid: function (id) {
    // Early return if inline help is already in place.
    if (this.inputMap[id].valid === false) {
      return;
    }

    var inlineHelp = $("<small></small>", {
      class: "form-message-error",
      text: this.inputMap[id].helpText,
    });

    this.inputMap[id].valid = false;
    $(this.inputMap[id].elm)
      .parents(".js-Form-group")
      .removeClass("js-no-error")
      .addClass("js-form-error");

    if (id === "image") {
      inlineHelp.insertAfter(".js-label-upload");
    }

    this.disableSubmits();
  },
  makeValid: function (id) {
    this.inputMap[id].valid = true;
    $(this.inputMap[id].elm)
      .parents(".js-Form-group")
      .removeClass("js-form-error")
      .addClass("js-no-error");

    if (this.inputMap[id].valid) {
      this.enableSubmits();
    }
  },
  disableSubmits: function () {
    this._submitButton.prop("disabled", true);
    this._submitButton.addClass("is-disabled");
  },
  enableSubmits: function () {
    this._submitButton.prop("disabled", false);
    this._submitButton.removeClass("is-disabled");
  },
});

issues.MainView = Backbone.View.extend(
  _.extend(
    {},
    {
      el: $(".js-Issue"),
      events: {
        "click .js-Issue-comment-button": "addNewComment",
        "click .issue-details-nsfw": "toggleNSFW",
      },
      keyboardEvents: {
        g: "githubWarp",
      },
      _supportsFormData: "FormData" in window,
      _isNSFW: undefined,
      initialize: function () {
        var body = $(document.body);
        var issueData = $(".js-Issue").data("issueData");
        body.addClass("language-html");
        this.issue = new Issue(JSON.parse(issueData), {
          parse: true,
        });
        this.initSubViews(
          _.bind(function () {
            // set listener for closing category editor only after its
            // been initialized.
            body.click(_.bind(this.closeCategoryEditor, this));
          }, this)
        );
        this.onAfterInit();
        this.handleKeyShortcuts();
      },
      closeCategoryEditor: function (e) {
        var target = $(e.target);
        // early return if the editor is closed,
        if (
          // If no category editor is visible
          !this.$el.find(".js-CategoryEditor").is(":visible") ||
          // or we've clicked on the button to open it,
          (target[0].nodeName === "BUTTON" &&
            target.hasClass("js-CategoryEditorLauncher")) ||
          // or clicked anywhere inside the label editor
          target.parents(".js-CategoryEditor").length
        ) {
          // Clicking on one launcher will force to close the other one
          if (
            target[0].nodeName === "BUTTON" &&
            target.hasClass("js-LabelEditorLauncher")
          ) {
            this.milestones.closeEditor();
          } else if (
            target[0].nodeName === "BUTTON" &&
            target.hasClass("js-MilestoneEditorLauncher")
          ) {
            this.labels.closeEditor();
          }
          return;
        } else {
          // Click outside, close both editors
          this.labels.closeEditor();
          this.milestones.closeEditor();
        }
      },
      githubWarp: function (e) {
        var warpPipe = $(".js-github-url").attr("href");
        if (e.target.nodeName === "TEXTAREA") {
          return;
        } else {
          return (location.href = warpPipe);
        }
      },
      initSubViews: function (callback) {
        var issueModel = { model: this.issue };
        this.aside = new issues.AsideView(issueModel);
        this.labels = new LabelsView(issueModel);
        this.milestones = new MilestonesView(issueModel);
        this.imageUpload = new issues.ImageUploadView();

        callback();
      },
      onAfterInit: function () {
        // _.find() will return the object if found (which is truthy),
        // or undefined if not found (which is falsey)
        this._isNSFW = !!_.find(
          this.issue.get("labels"),
          _.matchesProperty("name", "nsfw")
        );

        _.each([this.labels, this.milestones, this], function (elm) {
          elm.render();
          _.each($(".js-Issue-comment-body code"), function (elm) {
            Prism.highlightElement(elm);
          });
        });

        if (this._supportsFormData) {
          this.imageUpload.render();
        }

        // If there are any comments, go fetch the model data
        if (this.issue.get("commentNumber") > 0) {
          $.ajax(
            "/api/issues/" + this.issue.get("number") + "/comments?page=1",
            {
              type: "GET",
              dataType: "html",
            }
          )
            .done(
              _.bind(function (response) {
                $(".js-Issue-commentList").html(response);
                this.onAfterCommentsRendered();
                // If there's a #hash pointing to a comment (or elsewhere)
                // scrollTo it.
                if (location.hash !== "") {
                  var _id = $(location.hash);
                  window.scrollTo(0, _id.offset().top);
                }
              }, this)
            )
            .fail(function () {
              var msg =
                "There was an error retrieving issue comments. Please reload to try again.";
              wcEvents.trigger("flash:error", {
                message: msg,
                timeout: 4000,
              });
            });
        }
      },
      onAfterCommentsRendered: function () {
        // highlight codeblocks, and if there's a nsfw label
        // add the relevant class.
        var commentElm = $(".js-Issue-comment");
        _.each(commentElm.find("code"), function (elm) {
          Prism.highlightElement(elm);
        });
        if (this._isNSFW) {
          _.each(commentElm.find("img"), function (elm) {
            $(elm).closest("p").addClass("issue-details-nsfw");
          });
        }
      },
      addNewComment: function (event) {
        var form = $(".js-Comment-form");
        var textarea = $(".js-Comment-text");
        var loadingIndicator = form.find(".js-loader");

        if (form[0].checkValidity()) {
          event.preventDefault();
          loadingIndicator.addClass("is-active");
          $.ajax("/api/issues/" + this.issue.get("number") + "/comments", {
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
              body: textarea.val(),
            }),
          })
            .done(
              _.bind(function (response) {
                loadingIndicator.removeClass("is-active");
                textarea.val("");
                $(".js-Issue-commentList").append(response);
              }, this)
            )
            .fail(function () {
              var msg =
                "There was an error posting a comment. Please reload to try again.";
              wcEvents.trigger("flash:error", {
                message: msg,
                timeout: 4000,
              });
            });
        }
      },
      toggleNSFW: function (e) {
        // make sure we've got a reference to the <img> element,
        // (small images won't extend to the width of the containing
        // p.nsfw)
        var target =
          e.target.nodeName === "IMG"
            ? e.target
            : e.target.nodeName === "P" && e.target.querySelector("img");
        $(target)
          .parent()
          .removeAttr("href")
          .parent()
          .toggleClass("issue-details-nsfw--display");
      },
      render: function () {
        this.$el.removeClass("is-hidden");
        // only show issue commenting bits if the issue is not locked
        if (!this.issue.get("locked")) {
          this.$el.find(".js-issue-comment-submit").removeClass("is-hidden");
        }
      },

      handleKeyShortcuts: function () {
        Mousetrap.bind("mod+enter", _.bind(this.addNewComment, this));
      },
    }
  )
);

//Not using a router, so kick off things manually
new issues.MainView();
