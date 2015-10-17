/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};
var issueList = issueList || {};
issueList.user = $('body').data('username');


// UserActivityCollection inherits from IssueCollection, which doesn't set
// its url property directly. So we need to be sure to construct that from
// path and params manually.
issueList.UserActivityCollection = issueList.IssueCollection.extend({
  initialize: function(options) {
    this.url = '/api/issues/' + issueList.user + options.path +
               '?' + options.params;
  }
});

issueList.MyIssuesView = Backbone.View.extend({
  el: $('#my-issues'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new issueList.UserActivityCollection({
      path: '/creator',
      params: 'per_page=10'
    });
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

issueList.IssueMentionsView = Backbone.View.extend({
  el: $('#issue-mentions'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new issueList.UserActivityCollection({
      path: '/mentioned',
      params: 'per_page=10'
    });
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
  new issueList.MyIssuesView();
  new issueList.IssueMentionsView();
});
