/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

issues.CommentsCollection = Backbone.Collection.extend({
  model: issues.Comment,
  url: function() {
    var issueNumber = $("main").data("issueNumber");
    return "/api/issues/" + issueNumber + "/comments?page=" + this.pageNumber;
  },
  initialize: function(options) {
    this.pageNumber = options.pageNumber;
  },
  fetchPage: function(options) {
    if (options.pageNumber) {
      this.pageNumber = options.pageNumber;
    }
    return this.fetch(options);
  }
});

var commentMarkdownSanitizer = new MarkdownSanitizerMixin();

issues.CommentView = Backbone.View.extend(
  _.extend({}, commentMarkdownSanitizer, {
    className: "issue-comment js-Issue-comment grid-cell x2",
    id: function() {
      return this.model.get("commentLinkId");
    },
    template: wcTmpl["issue/issue-comment-list.jst"],
    render: function() {
      var modelData = this.model.toJSON();
      this.$el.html(this.template(modelData));
      return this;
    }
  })
);
