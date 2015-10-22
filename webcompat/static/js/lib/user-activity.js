/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};
var issueList = issueList || {};
var loadingIndicator =  $('.js-loader');
issueList.user = $('body').data('username');

// TODO: Put this in some kind of shared module
function fetchAndRenderIssues(options) {
  var headers = {headers: {'Accept': 'application/json'}};
  if (options && options.url) {
    this.issues.url = options.url;
  } else {
    this.issues.url = this.issues.path + '?' + $.param(this.issues.params);
  }

  this._loadingIndicator.addClass('is-active');
  this.issues.fetch(headers).success(_.bind(function() {
    this._loadingIndicator.removeClass('is-active');
    this.render(this.issues);
    this.initPaginationLinks(this.issues);
  }, this)).error(_.bind(function(e){
    var message;
    var timeout;
    if (e.responseJSON) {
      message = e.responseJSON.message;
      timeout = e.responseJSON.timeout * 1000;
    } else {
      message = 'Something went wrong!';
      timeout = 3000;
    }

    this._loadingIndicator.removeClass('is-active');
    wcEvents.trigger('flash:error', {message: message, timeout: timeout});
  }, this));
}

// UserActivityCollection inherits from IssueCollection, which doesn't set
// its url property directly. So we need to be sure to construct that from
// path and params manually.
issueList.UserActivityCollection = issueList.IssueCollection.extend({
  initialize: function(options) {
    this.url = '/api/issues/' + issueList.user + options.path +
               '?' + options.params;
  }
});

issueList.MyIssuesView = Backbone.View.extend(
  _.extend({}, PaginationMixin, {
  el: $('#my-issues'),
  _loadingIndicator: loadingIndicator,
  initialize: function() {
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new issueList.UserActivityCollection({
      path: '/creator',
      params: 'per_page=10'
    });
    PaginationMixin.initMixin(this, this.issues);
    this.fetchAndRenderIssues({url:this.issues.url});
  },
  template: _.template($('#my-issues-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      myIssues: this.issues.toJSON()
    }));

    return this;
  },
  updateModelParams: function() {
    //no-op for now, (if?) until we manage state in the URL
  },
  fetchAndRenderIssues: _.extend(fetchAndRenderIssues, this)
}));

issueList.IssueMentionsView = Backbone.View.extend({
  el: $('#issue-mentions'),
  _loadingIndicator: loadingIndicator,
  initialize: function() {
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.issues = new issueList.UserActivityCollection({
      path: '/mentioned',
      params: 'per_page=10'
    });

    this._loadingIndicator.addClass('is-active');
    this.fetchAndRenderIssues({url:this.issues.url});
  },
  template: _.template($('#issue-mentions-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      issueMentions: this.issues.toJSON()
    }));
    return this;
  },
  updateModelParams: function() {
    //no-op for now, (if?) until we manage state in the URL
  },
  fetchAndRenderIssues: _.extend(fetchAndRenderIssues, this)
});


$(function(){
  new issueList.MyIssuesView();
  new issueList.IssueMentionsView();
});
