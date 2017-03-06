/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {}; // eslint-disable-line no-use-before-define
issueList.events = _.extend({},Backbone.Events);

/*
PaginationControlsView Usage:
This assumes there is an element with a .js-dropdown-pagination class, e.g.:

{{ dropdown('default', 'js-dropdown-wrapper js-dropdown-pagination') }}

We just listen for and fire events from this view -
no template needed. It gets constructed in PaginationMixin.initMixin()
*/

issueList.PaginationControlsView = Backbone.View.extend({
  initialize: function(options) {
    this.el = options.el;
  },
  events: {
    "click .js-Pagination-previous": "broadcastPrevious",
    "click .js-Pagination-next": "broadcastNext",
  },
  broadcastNext: function(e) {
    issueList.events.trigger("paginate:next", e);
    e.preventDefault();
  },
  broadcastPrevious: function(e) {
    issueList.events.trigger("paginate:previous", e);
    e.preventDefault();
  }
});

/*
Pagination Mixin Usage:
issueList.IssueView = Backbone.View.extend(
  _.extend({}, PaginationMixin, {
  // regular view code here
  // ...
});

The mixin is initialized like so:

PaginationMixin.initMixin(hostView, hostModel, parentContainerEl);

parentContainerEl: a jQuery object that refers to a parent container of both
the hostView *and* the pagination controls.

The PaginationMixin requires the "host view" to
implement the following two methods:

fetchAndRenderIssues()
updateModelParams()

Check out issueList.IssueView for an example.
*/

/* exported PaginationMixin */
function PaginationMixin() {
  this.initMixin = function(hostView, hostModel, parentContainerEl) {
    this.view = hostView;
    this.model = hostModel;
    this.parentContainerEl = parentContainerEl;

    this.paginationControls = new issueList.PaginationControlsView(
      {el: this.parentContainerEl}
    );

    issueList.events.on("paginate:next", _.bind(this.requestNextPage, this));
    issueList.events.on("paginate:previous", _.bind(this.requestPreviousPage, this));
  };

  this.initPaginationLinks = function(issuesCollection) {
    // if either the next or previous page numbers are null
    // disable the buttons and add .is-disabled classes.
    var nextButton = this.paginationControls.el.find(".js-Pagination-next");
    var prevButton = this.paginationControls.el.find(".js-Pagination-previous");
    var nextPage = issuesCollection.getNextPage();
    var prevPage = issuesCollection.getPrevPage();
    var isLastPage = function() {
      return nextPage == null;
    };
    var isFirstPage = function() {
      return prevPage == null;
    };
    var isSinglePage = isLastPage() && isFirstPage();

    if (!issuesCollection.length || isSinglePage) {
      // hide pagination buttons if there are no results,
      // or the results are limited to a single page.
      nextButton.addClass("is-hidden");
      prevButton.addClass("is-hidden");
      return;
    }

    nextButton.removeClass("is-hidden")
              .prop("disabled", isLastPage())
              .toggleClass("is-disabled", isLastPage());
    prevButton.removeClass("is-hidden")
              .prop("disabled", isFirstPage())
              .toggleClass("is-disabled", isFirstPage());

    if (nextPage) {
      // chop off leading "/api" and set @href
      nextButton.attr("href", issuesCollection.getNextPage().substring(4));
    } else {
      nextButton.attr("href", "javascript: void(0);");
    }

    if (prevPage) {
      // chop off leading "/api" and set @href
      prevButton.attr("href", issuesCollection.getPrevPage().substring(4));
    } else {
      prevButton.attr("href", "javascript: void(0);");
    }
  };

  this.requestNextPage = function(e) {
    var nextPage;
    var pageNum;

    // don't try to paginate someone else's model.
    if (!$(e.target).parents(this.parentContainerEl.selector).length) {
      return;
    }

    if (nextPage = this.model.getNextPage()) {
      // update the URL to be in sync with the model
      pageNum = this.getPageNumberFromURL(nextPage);
      this.view.updateModelParams(pageNum);
      // we pass along the entire URL from the Link header
      this.view.fetchAndRenderIssues({url: nextPage});
    }
  };

  this.requestPreviousPage = function(e) {
    var prevPage;
    var pageNum;

    // don't try to paginate someone else's model.
    if (!$(e.target).parents(this.parentContainerEl.selector).length) {
      return;
    }

    if (prevPage = this.model.getPrevPage()) {
      // update the URL to be in sync with the model
      pageNum = this.getPageNumberFromURL(prevPage);
      this.view.updateModelParams(pageNum);
      // we pass along the entire URL from the Link header
      this.view.fetchAndRenderIssues({url: prevPage});
    }
  };

  this.getPageNumberFromURL = function(url) {
    // takes a string URL and extracts the page param/value pair.
    var match = /[?&](page=\d+)/i.exec(url);
    return match[1];
  };

  return this;
}
