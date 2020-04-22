/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define
issues.events = _.extend({}, Backbone.Events);

var issueMarkdownSanitizer = new MarkdownSanitizerMixin();

if (!window.md) {
  window.md = window
    .markdownit({
      breaks: true,
      html: true,
      linkify: true,
    })
    .use(window.markdownitSanitizer)
    .use(window.markdownitEmoji);
}
// Add links to @usernames and #issues
md.linkify.add("@", {
  validate: function (text, pos, self) {
    var tail = text.slice(pos);

    if (!self.re.gh_user) {
      self.re.gh_user = new RegExp(
        "^([a-zA-Z0-9_-]){1,30}(?=$|" + self.re.src_ZPCc + ")"
      );
    }
    if (self.re.gh_user.test(tail)) {
      return tail.match(self.re.gh_user)[0].length;
    }
    return 0;
  },
  normalize: function (match) {
    match.url = "https://github.com/" + match.url.replace(/^@/, "");
  },
});

md.linkify.add("#", {
  validate: function (text, pos, self) {
    var tail = text.slice(pos);

    if (!self.re.hash_bug) {
      self.re.hash_bug = new RegExp("^([0-9])+(?=$|" + self.re.src_ZPCc + ")");
    }
    if (self.re.hash_bug.test(tail)) {
      return tail.match(self.re.hash_bug)[0].length;
    }
    return 0;
  },
  normalize: function (match) {
    match.url = "/issues/" + match.url.replace(/^#/, "");
  },
});

var checkIfReportedURLOpeningA = function (tokens) {
  // check the tokens to see if we match the following markdown pattern
  // **URL**: http....
  if (
    tokens[0].markup === "**" &&
    tokens[1].content === "URL" &&
    tokens[2].markup === "**" &&
    tokens[3].content === ": " &&
    tokens[4].type === "link_open"
  ) {
    return true;
  }
  return false;
};

// Add rel=nofollow to links
var defaultLinkOpenRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  var foundReportedURL = checkIfReportedURLOpeningA(tokens);
  // only add target=_blank to a URL that was parsed from the following:
  // **URL**: <url>
  if (foundReportedURL) {
    tokens[idx].attrPush(["target", "_blank"]);
  }
  tokens[idx].attrPush(["rel", "nofollow"]);

  // Transform link text for some well-known sites
  if (tokens[idx].attrIndex("href") > -1) {
    var link = tokens[idx].attrs[tokens[idx].attrIndex("href")][1];
    var transformations = {
      "https://bugzilla.mozilla.org/show_bug": "Mozilla",
      "https://bugs.webkit.org/show_bug": "WebKit",
      "https://code.google.com/p/chromium/issues/detail?": "Chromium",
      "https://github.com/": "GitHub",
    };
    for (var bugtracker in transformations) {
      if (link.indexOf(bugtracker) > -1) {
        var bugNumRx = /(\?id=|\/issues\/)(\d+)/;
        var matches;
        if ((matches = link.match(bugNumRx))) {
          for (var i = idx, theToken; (theToken = tokens[i]); i++) {
            // find the token for link text
            if (theToken.content === link) {
              theToken.content =
                "#" + matches[2] + " (" + transformations[bugtracker] + ")";
              break;
            }
          }
        }
      }
    }
  }
  // pass token to default renderer.
  return defaultLinkOpenRender(tokens, idx, options, env, self);
};

issues.AsideView = Backbone.View.extend({
  el: $("#js-Issue-aside"),
  initialize: function () {
    this.model.on(
      "change:issueState",
      _.bind(function () {
        this.render();
      }, this)
    );
  },
  template: wcTmpl["issue/aside.jst"],
  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
});

issues.TextAreaView = Backbone.View.extend({
  el: $(".js-Comment-text"),
  events: {
    keydown: "broadcastChange",
  },
  broadcastChange: _.debounce(
    function () {
      if ($.trim(this.$el.val())) {
        issues.events.trigger("textarea:content");
      } else {
        issues.events.trigger("textarea:empty");
      }
    },
    250,
    { maxWait: 1500 }
  ),
});

issues.ImageUploadView = Backbone.View.extend({
  el: $(".js-ImageUploadView"),
  events: {
    "change .js-buttonUpload": "validateAndUpload",
  },
  _submitButton: $(".js-Issue-comment-button"),
  _loadingIndicator: $(".js-loader"),
  template: wcTmpl["issue/upload-image.jst"],
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
  _.extend({}, issueMarkdownSanitizer, {
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
      body.addClass("language-html");
      var issueNum = { number: $("main").data("issueNumber") };
      this.issue = new issues.Issue(issueNum);
      this.comments = new issues.CommentsCollection({ pageNumber: 1 });
      this.initSubViews(
        _.bind(function () {
          // set listener for closing category editor only after its
          // been initialized.
          body.click(_.bind(this.closeCategoryEditor, this));
        }, this)
      );
      this.fetchModels();
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
      var repoPath = $("main").data("repoPath");

      if (e.target.nodeName === "TEXTAREA") {
        return;
      } else {
        var warpPipe =
          "https://github.com/" + repoPath + "/" + this.issue.get("number");
        return (location.href = warpPipe);
      }
    },
    initSubViews: function (callback) {
      var issueModel = { model: this.issue };
      this.aside = new issues.AsideView(issueModel);
      this.labels = new issues.LabelsView(issueModel);
      this.milestones = new issues.MilestonesView(issueModel);
      this.textArea = new issues.TextAreaView();
      this.imageUpload = new issues.ImageUploadView();

      callback();
    },
    fetchModels: function () {
      var headersBag = { headers: { Accept: "application/json" } };
      this.issue
        .fetch(headersBag)
        .done(
          _.bind(function () {
            // _.find() will return the object if found (which is truthy),
            // or undefined if not found (which is falsey)
            this._isNSFW = !!_.find(
              this.issue.get("labels"),
              _.matchesProperty("name", "nsfw")
            );

            _.each([this.labels, this.milestones, this], function (elm) {
              elm.render();
              _.each($(".js-Issue-markdown code"), function (elm) {
                Prism.highlightElement(elm);
              });
            });

            if (this._supportsFormData) {
              this.imageUpload.render();
            }

            // If there are any comments, go fetch the model data
            if (this.issue.get("commentNumber") > 0) {
              this.comments
                .fetch(headersBag)
                .done(
                  _.bind(function (response) {
                    this.addExistingComments();
                    this.comments.bind("add", _.bind(this.addComment, this));
                    // If there's a #hash pointing to a comment (or elsewhere)
                    // scrollTo it.
                    if (location.hash !== "") {
                      var _id = $(location.hash);
                      window.scrollTo(0, _id.offset().top);
                    }
                    if (response[0].lastPageNumber > 1) {
                      this.getRemainingComments(++response[0].lastPageNumber);
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
          }, this)
        )
        .fail(function (response) {
          var msg;
          if (
            response &&
            response.responseJSON &&
            response.responseJSON.message === "API call. Not Found"
          ) {
            location.href = "/404";
            return;
          } else {
            msg =
              "There was an error retrieving the issue. Please reload to try again.";
            wcEvents.trigger("flash:error", { message: msg, timeout: 4000 });
          }
        });
    },

    getRemainingComments: function (count) {
      //The first 30 comments for page 1 has already been loaded.
      //If more than 30 comments are there the remaining comments are rendered in sets of 30
      //in consecutive pages

      _.each(
        _.bind(
          _.range(2, count),
          function (i) {
            this.comments.fetchPage({
              pageNumber: i,
              headers: { Accept: "application/json" },
            });
          },
          this
        )
      );
    },

    addComment: function (comment) {
      // if there's a nsfw label, add the relevant class.
      var view = new issues.CommentView({ model: comment });
      var commentElm = view.render().$el;
      $(".js-Issue-commentList").append(commentElm);
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

      if (form[0].checkValidity()) {
        event.preventDefault();
        var newComment = new issues.Comment({
          avatarUrl: form.data("avatarUrl"),
          body: this.sanitizeMarkdown(md.render(textarea.val())),
          commenter: form.data("username"),
          createdAt: moment(new Date().toISOString()).fromNow(),
          commentLinkId: null,
        });
        this.addComment(newComment);
        newComment.attributes.body = textarea.val();
        // Now empty out the textarea.
        textarea.val("");
        // Push to GitHub
        newComment.save();
      }
    },
    addExistingComments: function () {
      this.comments.each(_.bind(this.addComment, this));
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
  })
);

//Not using a router, so kick off things manually
new issues.MainView();
