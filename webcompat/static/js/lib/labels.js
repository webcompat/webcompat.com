/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import { LabelList } from "./models/label-list.js";
import { CategoryView, CategoryEditorView } from "./editor.js";
import issueLabelsTemplate from "templates/issue/issue-labels.jst";
import issueLabelsSubTemplate from "templates/issue/issue-labels-sub.jst";
import labelEditorTemplate from "templates/web_modules/label-editor.jst";

var issues = issues || {}; // eslint-disable-line no-use-before-define

// We need a complete list of labels for certain operations,
// especially namespace mapping. If the list we're handling
// doesn't happen to contain all the labels initially, it
// can't get prefixing/unprefixing right when labels in previously
// unseen namespaces are added in their local name form.
// Hence, we set up a single, globally accessible "all labels" model
// This is set up as early as possible to avoid timing issues

if ($("body").data("username")) {
  if (!issues.allLabels) {
    issues.allLabels = new LabelList();
  }
}

const LabelEditorView = CategoryEditorView.extend({
  initialize: function (options) {
    this.issueView = options.issueView;
  },
  template: labelEditorTemplate,
  updateView: function (evt) {
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
      _.each(checked, function (item) {
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
    _.each(checked, function (item) {
      //item already has a .name property
      item.remoteName = $(item).data("remotename");
      modelUpdate.push(item);
    });
    this.reRender({ labels: _.uniq(modelUpdate) });
  },
  closeEditor: function (e) {
    if (this.isOpen) {
      if (!e || (e && (e.keyCode === 27 || !e.keyCode))) {
        this.isOpen = false;
        var checked = this.$el.find("input[type=checkbox]:checked");
        var labelsArray = _.map(checked, "name");
        this.issueView.editorButton.removeClass("is-active");
        this.issueView.model.updateLabels(labelsArray);

        // detach() (vs remove()) here because we don't want to lose events if the
        // user reopens the editor.
        this.$el.children().detach();
        this.$el.removeClass("is-open");
        $("#body-webcompat").removeClass("is-label-editor-open");
      }
    }
  },
});

export const LabelsView = CategoryView.extend({
  el: $(".js-Issue-labels"),
  keyboardEvents: {
    l: "openEditor",
  },
  template: issueLabelsTemplate,
  // this subTemplate will need to be kept in sync with
  // relavant parts in issue/issue-labels.jst
  subTemplate: issueLabelsSubTemplate,
  closeEditor: function () {
    this.labelEditor.closeEditor();
  },
  fetchItems: function () {
    this.editorButton = $(".js-LabelEditorLauncher");
    if (this._isLoggedIn) {
      this.labelEditor = new LabelEditorView({
        model: issues.allLabels,
        issueView: this,
      });
      this.issueLabels = this.getIssueLabels();
      this.editorButton.show();
    }
  },
  getIssueLabels: function () {
    return _.map(this.model.get("labels"), "name");
  },
  openEditor: function (e) {
    // make sure we're not typing in the comment textfield.
    if (e && e.target.nodeName === "TEXTAREA") {
      return;
    }

    this.labelEditor.isOpen = true;
    this.editorButton.addClass("is-active");
    this.$el
      .find(".js-LabelEditorLauncher")
      .after(this.labelEditor.render().el);
    this.$el.find(".label-editor").addClass("is-open");
    $("#body-webcompat").addClass("is-label-editor-open");
    var toBeChecked = _.intersection(
      this.getIssueLabels(),
      issues.allLabels.toArray()
    );
    _.each(toBeChecked, function (labelName) {
      $('[name="' + labelName + '"]').prop("checked", true);
    });
    this.$el.closest(".label-box").scrollTop(this.$el.position().top);
  },
});
