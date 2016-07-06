/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

issues.CommentsCollection = Backbone.Collection.extend({
  model: issues.Comment,
  url: function() {
    return '/api/issues/' + issueNumber + '/comments?page=' + this.param;
  },
  initialize: function(param) {
    this.param = param[0].page;
  },
  fetchPage: function(commentPage, options) {
    if (commentPage.page) {
      this.param = commentPage.page;
    }
    return this.fetch(options);
  }
});

issues.CommentView = Backbone.View.extend({
  className: 'wc-Comment js-Issue-comment',
  id: function() {
    return this.model.get('commentLinkId');
  },
  template: _.template($('#comment-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});
