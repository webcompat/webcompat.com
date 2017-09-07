/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

issues.MilestonesModel = Backbone.Model.extend({
  initialize: function(options) {
    // transform the format from the server into something that our templates
    // are expecting.
    var milestones = [];
    _.forOwn(options.statuses, function(value, key) {
      var milestone = {};
      milestone["name"] = key;
      milestones.push(_.merge(milestone, value));
    });

    this.set("milestones", milestones);
  },
  toArray: function() {
    return _.pluck(this.get("milestones"), "name");
  }
});

issues.MilestonesView = issues.CategoryView.extend({
  el: $(".js-Issue-milestones"),
  keyboardEvents: {
    m: "openMilestoneEditor"
  },
  template: wcTmpl["issue/issue-milestones.jst"],
  // this subTemplate will need to be kept in sync with
  // relavant parts in issue/issue-labels.jst
  subTemplate: wcTmpl["issue/issue-labels-sub.jst"],
  openMilestoneEditor: function(e) {
    // make sure we're not typing in the search input.
    if (e.target.nodeName === "TEXTAREA") {
      return;
    } else {
      e.preventDefault();
      this.editItems();
    }
  },
  closeEditor: function() {
    this.milestoneEditor.closeEditor();
  },
  fetchItems: function() {
    this.editorButton = $(".js-CategoryEditorLauncher");
    this.milestoneEditor = new issues.MilestoneEditorView({
      model: new issues.MilestonesModel({
        statuses: $("main").data("statuses")
      }),
      issueView: this
    });
    if (this._isLoggedIn) {
      this.editorButton.show();
    }
  },
  editItems: function() {
    this.editorButton.addClass("is-active");
    this.$el
      .find(".js-CategoryEditorLauncher")
      .after(this.milestoneEditor.render().el);
    var toBeChecked = _.intersection(
      this.getIssueMilestones(),
      // TODO... fix this?
      issues.allLabels.toArray()
    );
    _.each(toBeChecked, function(labelName) {
      $('[name="' + labelName + '"]').prop("checked", true);
    });
  }
});

issues.MilestoneEditorView = issues.CategoryEditorView.extend({
  initialize: function(options) {
    this.issueView = options.issueView;
  },
  template: wcTmpl["web_modules/milestone-editor.jst"],
  updateView: function() {}, // no-op
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.resizeEditorHeight();
    _.defer(
      _.bind(function() {
        this.$el.find(".wc-CategoryEditor-search").focus();
      }, this)
    );
    return this;
  },
  closeEditor: function(e) {
    if (!e || (e && (e.keyCode === 27 || !e.keyCode))) {
      // var checked = $("input[type=checkbox]:checked");
      // var milestonesArray = _.pluck(checked, "name");
      this.issueView.editorButton.removeClass("is-active");
      // TODO: make this work
      // this.issueView.model.updateMilestones(milestonesArray);
      // detach() (vs remove()) here because we don't want to lose events if the
      // user reopens the editor.
      this.$el.children().detach();
    }
  }
});
