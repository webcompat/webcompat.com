/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Contains some code modified from https://github.com/jfromaniello/li
 * which is released under the MIT license. */

 var issues = issues || {};
 var issueList = issueList || {};

 if (!window.md) {
   window.md = window.markdownit({
     breaks: true,
     html: true,
     linkify: true
   }).use(window.markdownitSanitizer).use(window.markdownitEmoji);
 }

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
    var labelsNames = _.pluck(labels, 'name');
    if (state === 'closed') {
      this.set('stateClass', 'close');
      return 'Closed';
    }
    if (labelsNames.indexOf('sitewait') > -1) {
      this.set('stateClass', 'sitewait');
      return 'Site Contacted';
    }
    if (labelsNames.indexOf('contactready') > -1) {
      this.set('stateClass', 'ready');
      return 'Ready for Outreach';
    }
    if (labelsNames.indexOf('needsdiagnosis') > -1) {
      this.set('stateClass', 'need');
      return 'Needs Diagnosis';
    }
    //New is the default value.
    this.set('stateClass', 'new');
    return 'New Issue';
  },
  parse: function(response) {
    this.set({
      body: md.render(response.body),
      commentNumber: response.comments,
      createdAt: response.created_at.slice(0, 10),
      issueState: this.getState(response.state, response.labels),
      labels: response.labels,
      number: response.number,
      reporter: response.user.login,
      reporterAvatar: response.user.avatar_url,
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
        var msg = 'There was an error editing this issues\'s status.';
        wcEvents.trigger('flash:error', {message: msg, timeout: 2000});
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
        self.set('labels', response);
      },
      error: function() {
        var msg = 'There was an error setting labels.';
        wcEvents.trigger('flash:error', {message: msg, timeout: 2000});
      }
    });
  }
});

issueList.Issue = issues.Issue.extend({});

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  /* the url property is set in issueList.IssueView#fetchAndRenderIssues */
  initialize: function() {
    // set defaults
    this.params = {page: 1, per_page: 50, state: 'open', stage: 'all',
                   sort: 'created', direction: 'desc'};
    this.path = '/api/issues';
  },
  parse: function(response, jqXHR) {
    if (jqXHR.xhr.getResponseHeader('Link') != null) {
      //external code can access the parsed header via this.linkHeader
      this.linkHeader = this.parseHeader(jqXHR.xhr.getResponseHeader('Link'));
    } else {
      this.linkHeader = null;
    }
    if (response.hasOwnProperty('items')) {
      // Search API results return an Object with the
      // issues array in the items key
      return response.items;
    } else {
      return response;
    }
  },
  setURLState: function(path, params) {
    this.path = path;
    this.params = params;
  },
  parseHeader: function(linkHeader) {
    /* Returns an object like so:
      {
        next:  "/api/issues?per_page=50&state=open&page=3",
        last:  "/api/issues?per_page=50&state=open&page=4",
        first: "/api/issues?per_page=50&state=open&page=1",
        prev:  "/api/issues?per_page=50&state=open&page=1"
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
        var k, kLength = keys.length;
        for (k = 0; k < kLength; k += 1) {
          result[keys[k]] = source;
        }
      }
    }

    return result;
  },
  getNextPage: function() {
    if (this.linkHeader && this.linkHeader.hasOwnProperty('next')) {
      return this.linkHeader.next;
    } else {
      return null;
    }
  },
  getPrevPage: function() {
    if (this.linkHeader && this.linkHeader.hasOwnProperty('prev')) {
      return this.linkHeader.prev;
    } else {
      return null;
    }
  },
});
