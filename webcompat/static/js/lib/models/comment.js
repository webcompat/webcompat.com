/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

if (!window.md) {
  window.md = window.markdownit({
    breaks: true,
    html: true,
    linkify: true
  }).use(window.markdownitSanitizer).use(window.markdownitEmoji);
}

issues.Comment = Backbone.Model.extend({
  url: function() {
    return '/api/issues/' + issueNumber + '/comments';
  },
  parse: function(response, jqXHR) {
    this.set({
      avatarUrl: response.user.avatar_url,
      body: md.render(response.body),
      commenter: response.user.login,
      commentLinkId: 'issuecomment-' + response.id,
      createdAt: moment(response.created_at).fromNow(),
      rawBody: response.body
    });
    if (this.parseHeader(jqXHR.xhr.getResponseHeader('Link')).last) {
      response.lastPageNumber = this.parseHeader(jqXHR.xhr.getResponseHeader('Link')).last.split('\?page\=')[1];
    }
  },
  parseHeader: function(linkHeader) {
  //TODO: Abstract 'parseHeader' method from comment.js in to a mixin
  //See Issue #1118
    /* Returns an object like so:
      {
        next:  "comments?page=3",
        last:  "comments?page=4",
        first: "comments?page=1",
        prev:  "comments?page=1"
      } */
    var result = {};
    var entries = linkHeader.split(',');
    var relsRegExp = /\brel="?([^"]+)"?\s*;?/;
    var keysRegExp = /(\b[0-9a-z\.-]+\b)/g;
    var sourceRegExp = /^<(.*)>/;

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i].trim();
      var rels = relsRegExp.exec(entry);
      if (rels) {
        var keys = rels[1].match(keysRegExp);
        var source = sourceRegExp.exec(entry)[1];
        var k;
        var kLength = keys.length;
        for (k = 0; k < kLength; k += 1) {
          result[keys[k]] = source;
        }
      }
    }

    return result;
  }
});
