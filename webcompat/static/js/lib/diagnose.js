/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var diagnose = diagnose || {};
var issues = issues || {};

diagnose.NewCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/category/new'
});

diagnose.NewView = Backbone.View.extend({
  el: $('#new'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.NewCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function() {});
  },
  template: _.template($('#new-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // Just display the first 10.
      newIssues: this.issues.toJSON().slice(0, 10)
    }));
    return this;
  }
});

$(function() {
  new diagnose.NewView();
});
