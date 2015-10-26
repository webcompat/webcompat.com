/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};
var issueList = issueList || {};
var loadingIndicator =  $('.js-loader');
issueList.user = $('body').data('username');

var myIssuesPagination = new PaginationMixin();
var mentionsPagination = new PaginationMixin();

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
  _.extend({}, myIssuesPagination, {
  el: $('#my-issues'),
  _loadingIndicator: loadingIndicator,
  initialize: function() {
    this.issues = new issueList.UserActivityCollection({
      path: '/creator',
      params: 'per_page=10'
    });
    myIssuesPagination.initMixin(this, this.issues, $('#user-reported-issues'));
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
  fetchAndRenderIssues: function(options) {
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
      myIssuesPagination.initPaginationLinks(this.issues);
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
}));

issueList.IssueMentionsView = Backbone.View.extend(
  _.extend({}, mentionsPagination, {
  el: $('#issue-mentions'),
  _loadingIndicator: loadingIndicator,
  initialize: function() {
    this.issues = new issueList.UserActivityCollection({
      path: '/mentioned',
      params: 'per_page=10'
    });

    mentionsPagination.initMixin(this, this.issues, $('#user-mentioned-issues'));
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
  fetchAndRenderIssues: function(options) {
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
      mentionsPagination.initPaginationLinks(this.issues);
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
}));


$(function(){
  new issueList.MyIssuesView();
  new issueList.IssueMentionsView();
});
