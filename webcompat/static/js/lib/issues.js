/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};
issues.events = _.extend({},Backbone.Events);

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
  initialize: function() {
    var self = this;
    this.on('change:state', function() {
      self.set('issueState', self.getState(self.get('state'), self.get('labels')));
    });
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
    this.set('stateClass', 'need');
    return 'Needs Diagnosis';
  },
  parse: function(response) {
    if (response.message === "Not Found") {
      // "empty out" the model properties and bail.
      var emptyProps = {};
      var props = ['body', 'commentNumber', 'createdAt', 'issueState',
                   'labels', 'number', 'reporter', 'state', 'stateClass', 'title'];
      _.forEach(props, function(item) {
        emptyProps[item] = '';
      });
      this.set(emptyProps);
      location.href = "/404";
      return;
    }

    this.set({
      body: marked(response.body),
      commentNumber: response.comments,
      createdAt: moment(response.created_at).format('L'),
      issueState: this.getState(response.state, response.labels),
      labels: response.labels,
      number: response.number,
      reporter: response.user.login,
      state: response.state,
      title: response.title
    });
  },
  toggleState: function(callback) {
    var self = this;
    var newState = this.get('state') === 'open' ? 'closed' : 'open';
    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify({'state': newState}),
      type: 'PATCH',
      url: '/api/issues/' + this.get('number') + '/edit',
      success: function() {
        self.set('state', newState);
        if (callback) {
          callback();
        }
      },
      error: function() {
        $('<div></div>', {
          'class': 'flash error',
          'text': 'There was an error editing this issues\'s status.'
        }).appendTo('body');

        setTimeout(function(){
          var __flashmsg = $('.flash');
          if (__flashmsg.length) {__flashmsg.fadeOut();}
        }, 2000);
      }
    });
  },
  updateLabels: function(labelsArray) {
    var self = this;
    if (!$.isArray(labelsArray)) {
      return;
    }

    // save ourselves a request if nothing has changed.
    if (_.isEqual(labelsArray.sort(),
                  _.pluck(this.get('labels'), 'name').sort())) {
      return;
    }

    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify(labelsArray),
      type: 'POST',
      url: '/api/issues/' + this.get('number') + '/labels',
      success: function(response) {
        //update model after success
        self.set('labels', JSON.parse(response));
      },
      error: function() {
        $('<div></div>', {
          'class': 'flash error',
          'text': 'There was an error setting labels.'
        }).appendTo('body');

        setTimeout(function(){
          var __flashmsg = $('.flash');
          if (__flashmsg.length) {__flashmsg.fadeOut();}
        }, 2000);
      }
    });
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
  initialize: function() {
    var self = this;
    this.model.on('change:issueState', function() {
      self.render();
    });
  },
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

issues.TextAreaView = Backbone.View.extend({
  el: $('.comment__text'),
  events: {
    'keydown': 'broadcastChange'
  },
  broadcastChange: _.debounce(function() {
    if ($.trim(this.$el.val())) {
      issues.events.trigger('textarea:content');
    } else {
      issues.events.trigger('textarea:empty');
    }
  }, 250, {maxWait: 1500})
});

// TODO: add comment before closing if there's a comment.
issues.StateButtonView = Backbone.View.extend({
  el: $('.Button--action'),
  events: {
    'click': 'toggleState'
  },
  hasComment: false,
  mainView: null,
  initialize: function(options) {
    var self = this;
    this.mainView = options.mainView;

    issues.events.on('textarea:content', function() {
      self.hasComment = true;
      if (self.model.get('state') === 'open') {
        self.$el.text(self.template({state: "Close and comment"}));
      } else {
        self.$el.text(self.template({state: "Reopen and comment"}));
      }
    });

    issues.events.on('textarea:empty', function() {
      // Remove the "and comment" text if there's no comment.
      self.render();
    });

    this.model.on('change:state', function() {
      self.render();
    });
  },
  template: _.template($('#state-button-tmpl').html()),
  render: function() {
    var buttonText;
    if (this.model.get('state') === 'open') {
      buttonText = "Close Issue";
    } else {
      buttonText = "Reopen Issue";
    }
    this.$el.text(this.template({state: buttonText}));
    return this;
  },
  toggleState: function() {
    if (this.hasComment) {
      this.model.toggleState(_.bind(this.mainView.addNewComment, this.mainView));
    } else {
      this.model.toggleState();
    }
  }
});

issues.MainView = Backbone.View.extend({
  el: $('.issue'),
  events: {
    'click .Button--default': 'addNewComment'
  },
  keyboardEvents: {
    'g': 'githubWarp'
  },
  initialize: function() {
    $(document.body).addClass('language-html');
    var issueNum = {number: issueNumber};
    this.issue = new issues.Issue(issueNum);
    this.comments = new issues.CommentsCollection([]);
    this.initSubViews();
    this.fetchModels();
  },
  githubWarp: function() {
    var warpPipe = "http://github.com/" + repoPath + "/" + this.issue.get('number');
    return location.href = warpPipe;
  },
  initSubViews: function() {
    var issueModel = {model: this.issue};
    this.title = new issues.TitleView(issueModel);
    this.metadata = new issues.MetaDataView(issueModel);
    this.body = new issues.BodyView(issueModel);
    this.labels = new issues.LabelsView(issueModel);
    this.textArea = new issues.TextAreaView();
    this.stateButton = new issues.StateButtonView(_.extend(issueModel, {mainView: this}));
  },
  fetchModels: function() {
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issue.fetch(headersBag).success(function() {
      _.each([self.title, self.metadata, self.body, self.labels, self.stateButton, self],
        function(elm) {
          elm.render();
          _.each($('.issue__details code'), function(elm) {
            Prism.highlightElement(elm);
          });
        }
      );

      // If there are any comments, go fetch the model data
      if (self.issue.get('commentNumber') > 0) {
        self.comments.fetch(headersBag).success(function() {
          self.addExistingComments();
          self.comments.bind("add", self.addComment);

          // If there's a #hash pointing to a comment (or elsewhere)
          // scrollTo it.
          if (location.hash !== "") {
            var _id = $(location.hash);
            window.scrollTo(0, _id.offset().top);
          }
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
        commentLinkId: null,
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
