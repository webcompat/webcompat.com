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

issues.TitleView = Backbone.View.extend({
  el: $('.issue__main_title'),
  template: _.template($('#title-tmpl').html()),
  render: function() {
    document.title = "Issue " + this.model.get('number') +
                     ": " + this.model.get('title') +
                     " - webcompat.com";
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
    // hide metadata
    $('.issue__details > p:first-child:contains(-- @browser)').hide();
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
    'click .Button--default': 'addNewComment',
    'click': 'closeLabelEditor'
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
  closeLabelEditor: function(e) {
    var target = $(e.target);
    // early return if the editor is closed,
    if (!this.$el.find('.LabelEditor').is(':visible') ||
          // or we've clicked on the button to open it,
         (target[0].nodeName === 'BUTTON' && target.hasClass('issue__label--modify')) ||
           // or clicked anywhere inside the label editor
           target.parents('.LabelEditor').length) {
      return;
    } else {
      this.labels.closeEditor();
    }
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
    }).error(function(response) {
      if (response.responseJSON.message === "Not Found") {
        location.href = "/404";
        return;
      } else {
        $('<div></div>', {
          'class': 'flash error',
          'text': 'There was an error retrieving the issue.'
        }).appendTo('body');
      }
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

//Not using a router, so kick off things manually
new issues.MainView();
