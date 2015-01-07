/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var diagnose = diagnose || {};
var issues = issues || {};

diagnose.MyIssuesCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/category/mine'
});

diagnose.NeedsDiagnosisCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/category/needsdiagnosis'
});

diagnose.ContactReadyCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/category/contactready'
});

diagnose.NewCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/category/new'
});

diagnose.SiteWaitCollection = Backbone.Collection.extend({
  model: issues.Issue,
  url: '/api/issues/category/sitewait'
});

diagnose.MyIssuesView = Backbone.View.extend({
  el: $('#my-issues'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.MyIssuesCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#my-issues-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // manually slice out the latest 6.
      // in the future we'll allow the user to "scroll" these.
      userIssues: this.issues.toJSON().slice(0,6)
    }));
    return this;
  }
});

diagnose.NeedsDiagnosisView = Backbone.View.extend({
  el: $('#needs-diagnosis'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.NeedsDiagnosisCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#needs-diagnosis-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // manually slice out the latest 4.
      needsDiagnosis: this.issues.toJSON().slice(0,4)
    }));
    return this;
  }
});

diagnose.NewView = Backbone.View.extend({
  el: $('#new'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.NewCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#new-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // manually slice out the latest 4.
      newIssues: this.issues.toJSON().slice(0,4)
    }));
    return this;
  }
});

diagnose.SiteWaitView = Backbone.View.extend({
  el: $('#sitewait'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.SiteWaitCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#sitewait-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // manually slice out the latest 4.
      sitewait: this.issues.toJSON().slice(0,4)
    }));
    return this;
  }
});

diagnose.ContactReadyView = Backbone.View.extend({
  el: $('#ready-for-outreach'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.ContactReadyCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#contactready-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // manually slice out the latest 4.
      contactReady: this.issues.toJSON().slice(0,4)
    }));
    return this;
  }
});

$(function(){
  new diagnose.NeedsDiagnosisView();
  new diagnose.ContactReadyView();
  new diagnose.NewView();
  new diagnose.SiteWaitView();
});
