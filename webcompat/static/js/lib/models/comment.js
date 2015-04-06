/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

if (!window.$md) {
  window.$md = window.markdownit({
    breaks: true,
    linkify: true
  });
};

issues.Comment = Backbone.Model.extend({
  url: function() {
    return '/api/issues/' + issueNumber + '/comments';
  },
  parse: function(response) {
    this.set({
      avatarUrl: response.user.avatar_url,
      body: $md.render(response.body),
      commenter: response.user.login,
      commentLinkId: 'issuecomment-' + response.id,
      createdAt: moment(response.created_at).fromNow(),
      rawBody: response.body
    });
  }
});
