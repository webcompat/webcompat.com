/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

// We need a complete list of labels for certain operations,
// especially namespace mapping. If the list we're handling
// doesn't happen to contain all the labels initially, it
// can't get prefixing/unprefixing right when labels in previously
// unseen namespaces are added in their local name form.
// Hence, we set up a single, globally accessible "all labels" model
// This is set up as early as possible to avoid timing issues
if (!issues.allLabels) {
  issues.allLabels = new issues.LabelList();
}

issues.LabelsView = issues.CategoryView.extend({
  el: $(".js-Issue-labels"),
  keyboardEvents: {
    l: "openEditor"
  },
  template: wcTmpl["issue/issue-labels.jst"],
  // this subTemplate will need to be kept in sync with
  // relavant parts in issue/issue-labels.jst
  subTemplate: wcTmpl["issue/issue-labels-sub.jst"],
  closeEditor: function() {
    this.labelEditor.closeEditor();
  },
  fetchItems: function() {
    this.editorButton = $(".js-LabelEditorLauncher");
    this.labelEditor = new issues.LabelEditorView({
      model: issues.allLabels,
      issueView: this
    });
    if (this._isLoggedIn) {
      this.issueLabels = this.getIssueLabels();
      this.editorButton.show();
    }
  },
  getIssueLabels: function() {
    return _.pluck(this.model.get("labels"), "name");
  },
  openEditor: function(e) {
    // make sure we're not typing in the comment textfield.
    if (e && e.target.nodeName === "TEXTAREA") {
      return;
    }

    this.editorButton.addClass("is-active");
    this.$el
      .find(".js-LabelEditorLauncher")
      .after(this.labelEditor.render().el);
    var toBeChecked = _.intersection(
      this.getIssueLabels(),
      issues.allLabels.toArray()
    );
    _.each(toBeChecked, function(labelName) {
      $('[name="' + labelName + '"]').prop("checked", true);
    });
  }
});

issues.LabelEditorView = issues.CategoryEditorView.extend({
  initialize: function(options) {
    this.issueView = options.issueView;
  },
  template: wcTmpl["web_modules/label-editor.jst"],
  updateView: function(evt) {
    // We try to make sure only one priority"-type label is set
    // If the change event comes from a "priority"-type label,
    // enumerate all checked priority"-type labels and uncheck
    // the others.
    var checked;
    var remotename = $(evt.target).data("remotename");
    if (remotename.match(/^(priority)/) && evt.target.checked) {
      var prefix = remotename.split("-")[0];
      checked = this.$el.find(
        'input[type=checkbox][data-remotename^="' + prefix + '"]:checked'
      );
      _.each(checked, function(item) {
        if (item !== evt.target) {
          item.checked = false;
        }
      });
    }
    // we do the "real" save when you close the editor.
    // this just updates the UI responsively
    checked = this.$el.find("input[type=checkbox]:checked");
    // build up an array of objects that have
    // .name and .color props that the templates expect
    var modelUpdate = [];
    _.each(checked, function(item) {
      //item already has a .name property
      item.color = $(item).data("color");
      modelUpdate.push(item);
    });
    this.reRender({ labels: _.uniq(modelUpdate) });
  },
  closeEditor: function(e) {
    if (!e || (e && (e.keyCode === 27 || !e.keyCode))) {
      var checked = this.$el.find("input[type=checkbox]:checked");
      var labelsArray = _.pluck(checked, "name");
      this.issueView.editorButton.removeClass("is-active");
      this.issueView.model.updateLabels(labelsArray);
      // detach() (vs remove()) here because we don't want to lose events if the
      // user reopens the editor.
      this.$el.children().detach();
    }
  }
});
