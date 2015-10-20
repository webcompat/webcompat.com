/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {};
issueList.events = _.extend({},Backbone.Events);

/*
Pagination Mixin Usage:
issueList.IssueView = Backbone.View.extend(
  _.extend({}, PaginationMixin, {
  // regular view code here
  // ...
});

The mixin is initalized like so:

PaginationMixin.initMixin(hostView, hostModel);

One other things, the PaginationMixin requires the "host view" to
implement the following two methods:

fetchAndRenderIssues()
updateModelParams()

Check out issueList.IssueView for an example.
*/

var PaginationMixin = {
  initMixin: function(hostView, hostModel) {
    this.view = hostView;
    this.model = hostModel;

    issueList.events.on('paginate:next', _.bind(this.requestNextPage, this));
    issueList.events.on('paginate:previous', _.bind(this.requestPreviousPage, this));
  },
  _nextButton: $('.js-pagination-next'),
  _prevButton: $('.js-pagination-previous'),
  initPaginationLinks: function(issues) {
    // if either the next or previous page numbers are null
    // disable the buttons and add .is-disabled classes.
    var nextPage = this.issues.getNextPage();
    var prevPage = this.issues.getPrevPage();
    var isLastPage = function() {
      return nextPage == null;
    };
    var isFirstPage = function() {
      return prevPage == null;
    };
    var isSinglePage = isLastPage() && isFirstPage();

    if (!issues.length || isSinglePage) {
      // hide pagination buttons if there are no results,
      // or the results are limited to a single page.
      this._nextButton.addClass('wc-hidden');
      this._prevButton.addClass('wc-hidden');
      return;
    }

    this._nextButton.removeClass('wc-hidden')
                    .prop('disabled', isLastPage())
                    .toggleClass('is-disabled', isLastPage());
    this._prevButton.removeClass('wc-hidden')
                    .prop('disabled', isFirstPage())
                    .toggleClass('is-disabled', isFirstPage());

    if (nextPage) {
      // chop off leading "/api" and set @href
      this._nextButton.attr('href', this.issues.getNextPage().slice(4));
    } else {
      this._nextButton.attr('href', 'javascript: void(0);');
    }

    if (prevPage) {
      // chop off leading "/api" and set @href
      this._prevButton.attr('href', this.issues.getPrevPage().slice(4));
    } else {
      this._prevButton.attr('href', 'javascript: void(0);');
    }
  },
  requestNextPage: function() {
    var nextPage;
    var pageNum;

    if (nextPage = this.model.getNextPage()) {
      // update the URL to be in sync with the model
      pageNum = this.getPageNumberFromURL(nextPage);
      this.view.updateModelParams(pageNum);
      // we pass along the entire URL from the Link header
      this.view.fetchAndRenderIssues({url: nextPage});
    }
  },
  requestPreviousPage: function() {
    var prevPage;
    var pageNum;

    if (prevPage = this.model.getPrevPage()) {
      // update the URL to be in sync with the model
      pageNum = this.getPageNumberFromURL(prevPage);
      this.view.updateModelParams(pageNum);
      // we pass along the entire URL from the Link header
      this.view.fetchAndRenderIssues({url: prevPage});
    }
  },
  getPageNumberFromURL: function(url) {
    // takes a string URL and extracts the page param/value pair.
    var match = /[?&](page=\d+)/i.exec(url);
    return match[1];
  }
};