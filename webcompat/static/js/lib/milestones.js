/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

issues.MilestonesView = issues.CategoryView.extend({
  el: $(".js-Issue-milestones"),
  keyboardEvents: {
    m: "openEditor"
  },
  template: wcTmpl["issue/issue-milestones.jst"],
  // this subTemplate will need to be kept in sync with
  // relavant parts in issue/issue-labels.jst
  subTemplate: wcTmpl["issue/issue-milestones-sub.jst"],
  closeEditor: function() {
    this.milestoneEditor.closeEditor();
  },
  fetchItems: function() {
    this.editorButton = $(".js-MilestoneEditorLauncher");
    this.milestoneEditor = new issues.MilestoneEditorView({
      model: new issues.MilestonesModel({
        statuses: $("main").data("statuses"),
        issueModel: this.model
      }),
      issueView: this
    });
    if (this._isLoggedIn) {
      this.editorButton.show();
    }
  },
  openEditor: function(e) {
    // make sure we're not typing in the comment textfield.
    if (e && e.target.nodeName === "TEXTAREA") {
      return;
    }

    this.milestoneEditor.isOpen = true;
    this.editorButton.addClass("is-active");
    this.$el
      .find(".js-MilestoneEditorLauncher")
      .after(this.milestoneEditor.render().el);

    $('[name="' + this.model.get("milestone") + '"]').prop("checked", true);
  }
});

issues.MilestoneEditorView = issues.CategoryEditorView.extend({
  initialize: function(options) {
    this.issueView = options.issueView;
  },
  template: wcTmpl["web_modules/milestone-editor.jst"],
  updateView: function(evt) {
    // We try to make sure only one milestone is set
    // enumerate all checked milestones and uncheck the others.
    var checked = this.$el.find(
      'input[type=checkbox][data-remotename^="milestone"]:checked'
    );
    _.each(checked, function(item) {
      if (item !== evt.target) {
        item.checked = false;
      }
    });
    checked = this.$el.find("input[type=checkbox]:checked");
    // we do the "real" save when you close the editor.
    // this just updates the UI responsively
    this.reRender({
      milestone: checked.prop("name"),
      color: checked.data("color")
    });
  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.resizeEditorHeight();
    _.defer(
      _.bind(function() {
        this.$el.find(".js-MilestoneEditor-search").focus();
      }, this)
    );
    return this;
  },
  closeEditor: function(e) {
    if (this.isOpen) {
      if (!e || (e && (e.keyCode === 27 || !e.keyCode))) {
        this.isOpen = false;
        var checked = this.$el
          .find("input[type=checkbox]:checked")
          .prop("name");
        this.model.updateMilestone(checked);

        // detach() (vs remove()) here because we don't want to lose events if the
        // user reopens the editor.
        this.$el.children().detach();
        this.issueView.editorButton.removeClass("is-active");
      }
    }
  }
});
