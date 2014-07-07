/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

marked.setOptions({
  breaks: true,
  gfm: true,
  sanitize: true
})

issues.Issue = Backbone.Model.extend({
  urlRoot: function() {
    var base = 'https://api.github.com/repos/webcompat/web-bugs/issues/';
    return base + this.get('number');
  },
  defaults: {
    stateClass: 'need'
  },
  getState: function(state, labels) {
    if (state === 'closed') {
      this.set('stateClass', 'close');
      return 'Closed';
    }

    var labelsNames = _.pluck(labels, 'name');
    if (labelsNames.indexOf('sitewait') > -1) {
      this.set('stateClass', 'sitewait');
      return 'Site Contacted';
    }

    if (labelsNames.indexOf('contactready') > -1) {
      this.set('stateClass', 'ready');
      return 'Ready for Outreach';
    }
    //Needs Diagnosis is the default value.
    //stateClass is set in this.defaults
    return 'Needs Diagnosis';
  },
  parseLabels: function(labels) {
    return _.pluck(labels, 'name').join(', ');
  },
  parse: function(response) {
    this.set({
      body: marked(response.body),
      commentNumber: response.comments,
      createdAt: moment(response.created_at).format('L'),
      issueState: this.getState(response.state, response.labels),
      labels: this.parseLabels(response.labels),
      number: response.number,
      reporter: response.user.login,
      title: response.title
    });
  }
});

issues.Comment = Backbone.Model.extend({
  parse: function(response) {
    this.set({
      commenter: response.user.login,
      createdAt: moment(response.created_at).fromNow(),
      avatarUrl: response.user.avatar_url,
      body: response.body
    });
  }
});

issues.CommentsCollection = Backbone.Collection.extend({
  model: issues.Comment,
  url: function() {
    var base = 'https://api.github.com/repos/webcompat/web-bugs/issues/';
    return base + issueNumber + '/comments';
  }
});

issues.CommentView = Backbone.View.extend({
  className: 'issue__comment',
  template: _.template($('#comment-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

issues.TitleView = Backbone.View.extend({
  el: $('.issue__main_title'),
  template: _.template($('#title-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

issues.MetaDataView = Backbone.View.extend({
  el: $('.issue__create'),
  template: _.template($('#metadata-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

issues.BodyView = Backbone.View.extend({
  el: $('.issue__info'),
  template: _.template($('#issue-info-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

issues.MainView = Backbone.View.extend({
  el: $('.maincontent'),
  initialize: function() {
    var issueNum = {number: issueNumber};
    this.issue = new issues.Issue(issueNum);
    this.comments = new issues.CommentsCollection([]);
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
    this.issue.fetch().success(function() {
      _.each([self.title, self.metadata, self.body, self], function(elm) {
        elm.render();
      });

      // If there are any comments, go fetch the model data
      if (self.issue.get('commentNumber') > 0) {
        self.comments.fetch().success(function() {
          self.addExistingComments();
        });
      }
    }).error(function(){console.log('set up flash message');});
  },
  addComment: function(comment) {
    var view = new issues.CommentView({model: comment});
    this.$(".comment").append(view.render().el);
  },
  addExistingComments: function() {
    this.comments.each(this.addComment, this);
  },
  render: function() {
    this.$el.fadeIn();
  }
});

jQuery.ajaxSetup({timeout: 5000});
//Not using a router, so kick off things manually
new issues.MainView();
