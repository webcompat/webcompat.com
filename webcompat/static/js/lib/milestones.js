/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import { CategoryView, CategoryEditorView } from "./editor.js";
import { MilestonesModel } from "./models/milestones.js";
import issueMilestonesTemplate from "templates/issue/issue-milestones.jst";
import issueMilestonesSubTemplate from "templates/issue/issue-milestones-sub.jst";
import milestoneEditorTemplate from "templates/web_modules/milestone-editor.jst";

const MilestoneEditorView = CategoryEditorView.extend({
  initialize: function (options) {
    this.issueView = options.issueView;
  },
  template: milestoneEditorTemplate,
  updateView: function (evt) {
    // We try to make sure only one milestone is set
    // enumerate all checked milestones and uncheck the others.
    var checked = this.$el.find(
      'input[type=checkbox][data-remotename^="milestone"]:checked'
    );
    _.each(checked, function (item) {
      if (item !== evt.target) {
        item.checked = false;
      }
    });
    checked = this.$el.find("input[type=checkbox]:checked");
    // we do the "real" save when you close the editor.
    // this just updates the UI responsively
    this.reRender({
      milestone: checked.prop("name"),
      color: checked.data("color"),
    });
  },
  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.resizeEditorHeight();
    _.defer(
      _.bind(function () {
        this.$el.find(".js-MilestoneEditor-search").focus();
      }, this)
    );
    return this;
  },
  closeEditor: function (e) {
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
        this.$el.removeClass("is-open");
        $("#body-webcompat").removeClass("is-label-editor-open");
      }
    }
  },
});

export const MilestonesView = CategoryView.extend({
  el: $(".js-Issue-milestones"),
  keyboardEvents: {
    m: "openEditor",
  },
  template: issueMilestonesTemplate,
  // this subTemplate will need to be kept in sync with
  // relavant parts in issue/issue-labels.jst
  subTemplate: issueMilestonesSubTemplate,
  closeEditor: function () {
    this.milestoneEditor.closeEditor();
  },
  fetchItems: function () {
    this.editorButton = $(".js-MilestoneEditorLauncher");
    this.milestoneEditor = new MilestoneEditorView({
      model: new MilestonesModel({
        statuses: $("main").data("statuses"),
        issueModel: this.model,
      }),
      issueView: this,
    });
    if (this._isLoggedIn) {
      this.editorButton.show();
    }
  },
  openEditor: function (e) {
    // make sure we're not typing in the comment textfield.
    if (e && e.target.nodeName === "TEXTAREA") {
      return;
    }
    this.milestoneEditor.isOpen = true;
    this.editorButton.addClass("is-active");
    this.$el
      .find(".js-MilestoneEditorLauncher")
      .after(this.milestoneEditor.render().el);
    this.$el.find(".label-editor").addClass("is-open");
    $("#body-webcompat").addClass("is-label-editor-open");

    $('[name="' + this.model.get("milestone") + '"]').prop("checked", true);
    this.$el.closest(".label-box").scrollTop(this.$el.position().top);
  },
});
