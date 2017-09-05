/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
var issues = issues || {}; // eslint-disable-line no-use-before-define

/* Child classes need to define the following methods/properties:
    * closeEditor
    * editItems
    * fetchItems (to get data from model)
    * template
    * subTemplate
*/
issues.CategoryView = Backbone.View.extend({
  _isLoggedIn: $("body").data("username"),
  editorButton: null,
  events: {
    "click .js-LabelEditorLauncher:not(.is-active)": "editItems",
    "click .js-LabelEditorLauncher.is-active": "closeEditor"
  },
  // template/subTemplate is defined in child class
  openLabelEditor: function(e) {
    // make sure we're not typing in the search input.
    if (e.target.nodeName === "TEXTAREA") {
      return;
    } else {
      e.preventDefault();
      this.editItems();
    }
  },
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
  // todo, change these classes to be itemeditor, etc.
  className: "wc-LabelEditor js-LabelEditor",
  events: {
    "change input[type=checkbox]": "updateView",
    "click button": "closeEditor",
    keyup: "closeEditor",
    "keyup .wc-LabelEditor-search": "filterItems",
    "keyup .wc-LabelEditor-list-item": "checkUncheckItems",
    "keydown .wc-LabelEditor-search": "focusSaveClose",
    "keydown .wc-LabelEditor-list-item": "removeFocus",
    "keydown .wc-LabelEditor-list-item:visible:last": "backToTop"
  },
  render: function() {
    this.$el.html(this.template(this.model));
    this.resizeEditorHeight();
    _.defer(
      _.bind(function() {
        this.$el.find(".wc-LabelEditor-search").focus();
      }, this)
    );
    return this;
  },
  reRender: function(data) {
    //only re-render the items into the items wrapper
    this.issueView.$el
      .find(".js-Label-list")
      .html(this.issueView.subTemplate(data));
    this.issueView.$el.find(".js-LabelEditorLauncher").addClass("is-active");
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
        var labelEditorheight = parseInt(
          $(".wc-LabelEditor").css("height"),
          10
        );
        var labelHeaderheight = parseInt(
          $(".wc-LabelEditor-header").css("height"),
          10
        );
        $(".wc-LabelEditor-list").height(labelEditorheight - labelHeaderheight);
        $("html, body").animate({ scrollTop: 0 }, 0);
      });
    }
  },
  filterItems: _.debounce(function(e) {
    setTimeout(function() {
      if (e.keyCode === 13) {
        $(".wc-LabelEditor-list-item:visible:first").focus();
        // if you call the focus() function in a label element,'
        // the focus automatically goes to the input.
        // that's why we need to add the focused class.
        $(".wc-LabelEditor-list-item:visible:first").addClass("focused");
      }
    }, 100);

    var escape = function(s) {
      return s.replace(/[-\/\\^$*+?:.()|[\]{}]/g, "\\$&");
    };
    var re = new RegExp("^" + escape(e.target.value), "i");
    var toHide = _.filter(this.model.toArray(), function(label) {
      return !re.test(label);
    });

    // make sure everything is showing
    $(".wc-LabelEditor-list-item").show();

    // hide the non-filter matches
    _.each(toHide, function(name) {
      $("input[name=" + escape(name) + "]")
        .closest(".wc-LabelEditor-list-item")
        .hide();
    });
  }, 100),
  checkUncheckItems: _.debounce(function(e) {
    if (e.keyCode === 13) {
      $(e.target).click().addClass("focused");
    }
  }, 100),
  focusSaveClose: _.debounce(function(e) {
    if (e.keyCode === 9) {
      // Safari workaround.
      $(".wc-LabelEditor-button.r-ResetButton").focus();
    }
  }, 1),
  removeFocus: _.debounce(function(e) {
    if (e.keyCode === 9) {
      $(e.target).closest("label").removeClass("focused");
    }
  }, 100),
  backToTop: _.debounce(function(e) {
    if (e.keyCode === 9) {
      this.$el.find(".wc-LabelEditor-search").focus();
    }
  }, 1)
});
