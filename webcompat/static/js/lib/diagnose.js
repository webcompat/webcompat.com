/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var diagnose = diagnose || {}; // eslint-disable-line no-use-before-define
var issues = issues || {}; // eslint-disable-line no-use-before-define

diagnose.NeedsTriageCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: "/api/issues/category/needstriage"
});

diagnose.NeedsTriageView = Backbone.View.extend({
  el: $("#js-lastIssue"),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {"Accept": "application/json"}};
    this.issues = new diagnose.NeedsTriageCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function() {});
  },
  template: _.template($("#needstriage-tmpl").html()),
  render: function() {
    this.$el.html(this.template({
      // Just display the first 10.
      issues: this.issues.toJSON().slice(0, 10)
    }));
    return this;
  }
});

$(function() {
  new diagnose.NeedsTriageView();
});
