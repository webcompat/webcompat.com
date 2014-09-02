/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var diagnose = diagnose || {};

diagnose.Issue = Backbone.Model.extend({
  getStateClass: function(state, labels) {
    var labelsNames = _.pluck(labels, 'name');
    if (state === 'closed') {
      this.set('state', 'closed');
      return;
    } else if (labelsNames.indexOf('contactready') > -1) {
      this.set('state', 'contactready');
      return;
    } else if (labelsNames.indexOf('sitewait') > -1) {
      this.set('state', 'sitewait');
      return;
    } else if (labelsNames.indexOf('needsdiagnosis') > -1) {
      this.set('state', 'needs-diagnosis');
      return;
    } else {
      this.set('state', 'untriaged');
    }
  },
  parse: function(response) {
    this.getStateClass(response.state, response.labels);
    this.set({
      commentsNumber: response.comments,
      createdAt: response.created_at.slice(0,10),
      number: response.number,
      title: response.title,
    });
  }
});

diagnose.MyIssuesCollection = Backbone.Collection.extend({
  model: diagnose.Issue,
  url: '/api/issues/mine'
});

diagnose.NeedsDiagnosisCollection = Backbone.Collection.extend({
  model: diagnose.Issue,
  url: '/api/issues/needsdiagnosis'
});

diagnose.ContactReadyCollection = Backbone.Collection.extend({
  model: diagnose.Issue,
  url: '/api/issues/contactready'
});

diagnose.UntriagedCollection = Backbone.Collection.extend({
  model: diagnose.Issue,
  url: '/api/issues/untriaged'
});

diagnose.SiteWaitCollection = Backbone.Collection.extend({
  model: diagnose.Issue,
  url: '/api/issues/sitewait'
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
      // in the future we'll allow the user to "scroll" these.
      needsDiagnosis: this.issues.toJSON().slice(0,4)
    }));
    return this;
  }
});

diagnose.UntriagedView = Backbone.View.extend({
  el: $('#untriaged'),
  initialize: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new diagnose.UntriagedCollection();
    this.issues.fetch(headersBag).success(function() {
      self.render();
    }).error(function(){});
  },
  template: _.template($('#untriaged-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      // manually slice out the latest 4.
      // in the future we'll allow the user to "scroll" these.
      untriaged: this.issues.toJSON().slice(0,4)
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
      // in the future we'll allow the user to "scroll" these.
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
      // in the future we'll allow the user to "scroll" these.
      contactReady: this.issues.toJSON().slice(0,4)
    }));
    return this;
  }
});

$(function(){
  new diagnose.NeedsDiagnosisView();
  new diagnose.ContactReadyView();
  new diagnose.UntriagedView();
  new diagnose.SiteWaitView();
});
