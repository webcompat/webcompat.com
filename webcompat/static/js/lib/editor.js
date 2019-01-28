/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var issues = issues || {}; // eslint-disable-line no-use-before-define

/* Child classes need to define the following methods/properties:
 * closeEditor
 * openEditor
 * fetchItems (to get data from model)
 * template
 * subTemplate
 */
issues.CategoryView = Backbone.View.extend({
  _isLoggedIn: $("body").data("username"),
  editorButton: null,
  events: {
    "click .js-CategoryEditorLauncher:not(.is-active)": "openEditor",
    "click .js-CategoryEditorLauncher.is-active": "closeEditor"
  },
  // template/subTemplate is defined in child class
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.fetchItems();
    return this;
  }
});

/* Child classes need to define the following methods/properties, or this will explode:
 * closeEditor
 * template
 * updateView
 */
issues.CategoryEditorView = Backbone.View.extend({
  isOpen: false,
  className: "label-editor js-CategoryEditor",
  events: {
    "change input[type=checkbox]": "updateView",
    "click button": "closeEditor",
    keyup: "closeEditor",
    "keyup .label-editor-header .form-field": "filterItems",
    "keyup .label-editor-list-item": "checkUncheckItems",
    "keydown .label-editor-header .form-field": "focusSaveClose",
    "keydown .label-editor-list-item": "removeFocus",
    "keydown .label-editor-list-item:visible:last": "backToTop"
  },
  render: function() {
    this.$el.html(this.template(this.model));
    this.resizeEditorHeight();
    _.defer(
      _.bind(function() {
        this.$el.find(".label-editor-header .form-field").focus();
      }, this)
    );
    return this;
  },
  reRender: function(data) {
    //only re-render the items into the items wrapper
    this.issueView.$el
      .find(".js-Category-list")
      .html(this.issueView.subTemplate(data));
    this.issueView.$el.find(".js-CategoryEditorLauncher").addClass("is-active");
  },
  resizeEditorHeight: function() {
    var getBreakpoint = function() {
      var style;
      var doResize = false;
      if (
        window.getComputedStyle &&
        window.getComputedStyle(document.body, "::after")
      ) {
        style = window.getComputedStyle(document.body, "::after").content;
      }
      if (style.match(/resizeEditor/)) {
        doResize = true;
      }
      return doResize;
    };

    if (getBreakpoint()) {
      _.defer(function() {
        var categoryEditorheight = parseInt(
          $(".label-box-editor").css("height"),
          10
        );
        var categoryHeaderheight = parseInt(
          $(".label-editor-header").css("height"),
          10
        );
        $(".label-editor-list").height(
          categoryEditorheight - categoryHeaderheight
        );
        $("html, body").animate({ scrollTop: 0 }, 0);
      });
    }
  },
  filterItems: _.debounce(function(e) {
    setTimeout(function() {
      if (e.keyCode === 13) {
        $(".label-editor-list-item:visible:first").focus();
        // if you call the focus() function in a label element,'
        // the focus automatically goes to the input.
        // that's why we need to add the focused class.
        $(".label-editor-list-item:visible:first").addClass("focused");
      }
    }, 100);

    var escape = function(s) {
      return s.replace(/[-&:/.\s()]/g, "\\$&");
    };
    var re = new RegExp("^" + escape(e.target.value), "i");
    var toHide = _.filter(this.model.toArray(), function(label) {
      return !re.test(label);
    });

    // make sure everything is showing
    $(".label-editor-list-item").show();

    // hide the non-filter matches
    _.each(toHide, function(name) {
      $("input[name=" + escape(name) + "]")
        .next(".label-editor-list-item")
        .hide();
    });
  }, 100),
  checkUncheckItems: _.debounce(function(e) {
    if (e.keyCode === 13) {
      $(e.target)
        .click()
        .addClass("focused");
    }
  }, 100),
  focusSaveClose: _.debounce(function(e) {
    if (e.keyCode === 9) {
      // Safari workaround.
      $(".label-editor-header .button").focus();
    }
  }, 1),
  removeFocus: _.debounce(function(e) {
    if (e.keyCode === 9) {
      $(e.target)
        .closest("label")
        .removeClass("focused");
    }
  }, 100),
  backToTop: _.debounce(function(e) {
    if (e.keyCode === 9) {
      this.$el.find(".label-editor-header .form-field").focus();
    }
  }, 1)
});
