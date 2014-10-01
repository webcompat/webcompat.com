/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {};
issueList.events = _.extend({},Backbone.Events);

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  url: '/api/issues'
});

issueList.FilterView = Backbone.View.extend({
  el: $('.js-issuelist-filter'),
  initialize: function() {
    this.model = new Backbone.Model();
  },
  template: _.template($('#issuelist-filter-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

issueList.IssueView = Backbone.View.extend({
  el: $('.js-issue-list'),
  initialize: function() {
    var self = this;
    var headers = {headers: {'Accept': 'application/json'}};
    this.issues = new issueList.IssueCollection();
    this.issues.fetch(headers).success(function() {
      self.render();
    }).error(function(e){console.log(e);});
  },
  template: _.template($('#issuelist-issue-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      //can deal with "show N issues" either manually,
      //or request paginated results with N per page.
      //former more work, latter more API requests
      issues: this.issues.toJSON()
    }));
    return this;
  }
});

issueList.MainView = Backbone.View.extend({
  el: $('.js-issue-page'),
  events: {},
  keyboardEvents: {},
  initialize: function() {
    this.initSubViews();
  },
  initSubViews: function() {
    this.issueList = new issueList.IssueView();
    this.filter = new issueList.FilterView();
    this.render();
  },
  render: function() {
    //TODO: render filter post-model fetch. See Issue #291.
    // also bind will explode in old browsers.
    this.$el.fadeIn(function() {
      this.filter.render();
    }.bind(this));
  }
});

//Not using a router, so kick off things manually
new issueList.MainView();
