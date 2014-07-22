/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

marked.setOptions({
  breaks: true,
  gfm: true,
  emoji: true,
  ghUser: true,
  sanitize: true
});

issues.Issue = Backbone.Model.extend({
  urlRoot: function() {
    return '/api/issues/' + this.get('number');
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
  parse: function(response) {
    this.set({
      body: marked(response.body),
      commentNumber: response.comments,
      createdAt: moment(response.created_at).format('L'),
      issueState: this.getState(response.state, response.labels),
      labels: response.labels,
      number: response.number,
      reporter: response.user.login,
      title: response.title
    });
  }
});

issues.Comment = Backbone.Model.extend({
  url: function() {
    return '/api/issues/' + issueNumber + '/comments';
  },
  parse: function(response) {
    this.set({
      avatarUrl: response.user.avatar_url,
      body: marked(response.body),
      commenter: response.user.login,
      createdAt: moment(response.created_at).fromNow(),
      id: response.id,
      rawBody: response.body
    });
  }
});

issues.CommentsCollection = Backbone.Collection.extend({
  model: issues.Comment,
  url: function() {
    return '/api/issues/' + issueNumber + '/comments';
  }
});

issues.CommentView = Backbone.View.extend({
  className: 'comment',
  id: function() {
    return 'issuecomment-' + this.model.get('id');
  },
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
  el: $('.issue__details'),
  template: _.template($('#issue-info-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

issues.MainView = Backbone.View.extend({
  el: $('.issue'),
  events: {
    'click .Button--default': 'addNewComment'
  },
  initialize: function() {
    $(document.body).addClass('language-html');
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
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issue.fetch(headersBag).success(function() {
      _.each([self.title, self.metadata, self.body, self], function(elm) {
        elm.render();
        _.each($('.issue__details code'), function(elm){
          Prism.highlightElement(elm);
        });
      });

      // If there are any comments, go fetch the model data
      if (self.issue.get('commentNumber') > 0) {
        self.comments.fetch(headersBag).success(function() {
          self.addExistingComments();
          self.comments.bind("add", self.addComment);
        }).error(function() {
          $('<div></div>', {
            'class': 'flash error',
            'text': 'There was an error retrieving issue comments.'
          }).appendTo('body');

          setTimeout(function(){
            var __flashmsg = $('.flash');
            if (__flashmsg.length) {__flashmsg.fadeOut();}
          }, 2000);
        });
      }
    }).error(function() {
      $('<div></div>', {
        'class': 'flash error',
        'text': 'There was an error retrieving the issue.'
      }).appendTo('body');
    });
  },
  addComment: function(comment) {
    var view = new issues.CommentView({model: comment});
    var commentElm = view.render().el;
    $(".issue__comment").append(commentElm);
    _.each($(commentElm).find('code'), function(elm){
      Prism.highlightElement(elm);
    });
  },
  addNewComment: function() {
    var form = $('.comment--form');
    var textarea = $('.comment__text');
    // Only bother if the textarea isn't empty
    if ($.trim(textarea.val())) {
      var newComment = new issues.Comment({
        avatarUrl: form.data('avatarUrl'),
        body: marked(textarea.val()),
        commenter: form.data('username'),
        createdAt: moment(new Date().toISOString()).fromNow(),
        id: null,
        rawBody: textarea.val()
      });
      this.addComment(newComment);
      // Now empty out the textarea.
      textarea.val('');
      // Push to GitHub
      newComment.save();
    }
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
