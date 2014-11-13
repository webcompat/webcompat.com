/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Contains some code modified from https://github.com/jfromaniello/li
 * which is released under the MIT license. */

 var issues = issues || {};
 var issueList = issueList || {};

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
    //Untriaged is the default value.
    this.set('stateClass', 'untriaged');
    return 'Untriaged Issue';
  },
  parse: function(response) {
    this.set({
      body: marked(response.body),
      commentNumber: response.comments,
      createdAt: response.created_at.slice(0, 10),
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
        self.set('labels', response);
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

issueList.Issue = issues.Issue.extend({});

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  url: '/api/issues?page=1',
  parse: function(response, jqXHR) {
    if (jqXHR.xhr.getResponseHeader('Link') != null) {
      //external code can access the parsed header via this.linkHeader
      this.linkHeader = this.parseHeader(jqXHR.xhr.getResponseHeader('Link'));
    } else {
      this.linkHeader = null;
    }
    return response;
  },
  parseHeader: function(linkHeader) {
    /* Returns an object like so:
      {
        next: "https://api.github.com/repositories/17839063/issues?page=3",
        last: "https://api.github.com/repositories/17839063/issues?page=4",
        first: "https://api.github.com/repositories/17839063/issues?page=1",
        prev: "https://api.github.com/repositories/17839063/issues?page=1"
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
          result[keys[k]] = source
        }
      }
    }

    return result;
  },
  getPageFromRel: function(relation) {
    // GitHub will only send us a Link header if pagination is possible.
    // if we return early with null, we'll know that next and prev pagination
    // should be disabled.
    if (this.linkHeader == null) {
      return null;
    }
    var page;
    // we only return the page number
    var re = new RegExp('page=(\\d)');

    if (page = (this.linkHeader.hasOwnProperty(relation) &&
                this.linkHeader[relation].match(re))) {
      return page[1];
    } else {
      return null;
    }
  },
  getNextPageNumber: function() {
    return this.getPageFromRel('next');
  },
  getPreviousPageNumber: function() {
    return this.getPageFromRel('prev');
  }
});
