/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var untriaged = untriaged || {}; // eslint-disable-line no-use-before-define
var issues = issues || {}; // eslint-disable-line no-use-before-define

untriaged.NeedsTriageCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: "/api/issues/category/needstriage?per_page=5"
});

untriaged.NeedsTriageView = Backbone.View.extend({
  el: $("#js-lastIssue"),
  initialize: function() {
    var self = this;
    var headersBag = { headers: { Accept: "application/json" } };
    this.issues = new untriaged.NeedsTriageCollection();
    this.issues
      .fetch(headersBag)
      .done(function() {
        self.render();
      })
      .fail(function() {});
  },
  template: wcTmpl["web_modules/issue-list.jst"],
  render: function() {
    this.$el.html(
      this.template({
        // Just display the first 5.
        issues: this.issues.toJSON().slice(0, 5)
      })
    );
    return this;
  }
});

$(function() {
  new untriaged.NeedsTriageView();
});
