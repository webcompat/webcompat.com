/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var userActivity = userActivity || {};
var issues = issues || {};
userActivity.user = $('body').data('username');

userActivity.MyIssuesCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/' + userActivity.user + '/creator'
});

userActivity.MyIssuesView = Backbone.View.extend({
  el: $('#my-issues'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new userActivity.MyIssuesCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#my-issues-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      myIssues: this.issues.toJSON()
    }));
    return this;
  }
});

userActivity.IssueMentionsCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/' + userActivity.user + '/mentioned'
});

userActivity.IssueMentionsView = Backbone.View.extend({
  el: $('#issue-mentions'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new userActivity.IssueMentionsCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#issue-mentions-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      issueMentions: this.issues.toJSON()
    }));
    return this;
  }
});


$(function(){
  new userActivity.MyIssuesView();
  new userActivity.IssueMentionsView();
});
