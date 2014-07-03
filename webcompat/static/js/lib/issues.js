/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

issues.Issue = Backbone.Model.extend({
  urlRoot: function() {
    var base = 'https://api.github.com/repos/webcompat/web-bugs/issues/';
    return base + this.get('number');
  },
  defaults: {
    stateClass: 'need'
  },
  getState: function(state, labels) {
    var i;
    if (state == 'closed') {
      this.set('stateClass', 'close');
      return 'Closed';
    }

    var labelsNames = _.pluck(labels, 'name');
    if (labelsNames.indexOf('sitewait')) {
      this.set('stateClass', 'sitewait');
      return 'Site Contacted';
    }

    if (labelsNames.indexOf('contactready')) {
      this.set('stateClass', 'ready');
      return 'Ready for Outreach';
    }
    //Needs Diagnosis is the default value.
    //stateClass is set in this.defaults
    return 'Needs Diagnosis';
  },
  parseBody: function(body) {
    //need to tranform into expected HTML here....
    //or convert to markdown
    return body;
  },
  parseLabels: function(labels) {
    var labelsMap = $.map(labels, function(item) {
      if (item.hasOwnProperty('name')) {
        return item.name;
      }
    });
    return labelsMap.join(', ')
  },
  parse: function(response, options) {
    this.set({
      body: this.parseBody(response.body),
      commentNumber: response.comments,
      createdAt: response.created_at.slice(0,10).replace(/-/g, '/'),
      issueState: this.getState(response.state, response.labels),
      labels: this.parseLabels(response.labels),
      number: response.number,
      reporter: response.user.login,
      title: response.title
    });
  }
});

issues.Comments = Backbone.Model.extend({
  //Do comments stuff post MainView render
  urlRoot: function() {}
});

issues.TitleView = Backbone.View.extend({
  el: $('.issue__main_title'),
  template: _.template($('#title-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

issues.MetaDataView = Backbone.View.extend({
  el: $('.issue__create'),
  template: _.template($('#metadata-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

issues.BodyView = Backbone.View.extend({
  el: $('.issue__info'),
  template: _.template($('#issue-info-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

issues.MainView = Backbone.View.extend({
  el: $('.maincontent'),
  initialize: function(opts) {
    this.issue = new issues.Issue({number: issueNumber});
    this.initSubViews();
    this.fetchModels();
  },
  initSubViews: function() {
    this.title = new issues.TitleView({model: this.issue});
    this.metadata = new issues.MetaDataView({model: this.issue});
    this.body = new issues.BodyView({model: this.issue});
  },
  fetchModels: function() {
    var self = this;
    this.issue.fetch().success(function(){
      self.title.render();
      self.metadata.render();
      self.body.render();
      self.render();
    }).error(function(){console.log('set up flash message')});
  },
  render: function() {
    this.$el.fadeIn();
  }
});

jQuery.ajaxSetup({timeout: 5000});
//Not using a router, so kick off things manually
var mainView = new issues.MainView();
