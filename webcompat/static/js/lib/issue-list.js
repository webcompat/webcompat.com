/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {};
issueList.events = _.extend({},Backbone.Events);

issueList.DropdownView = Backbone.View.extend({
  events: {
    'click .js-dropdown-toggle': 'openDropdown',
    'click .js-dropdown-options li': 'selectDropdownOption'
  },
  initialize: function() {
    // this.el is set from parent view via setElement
    // handles closing dropdown when clicking "outside".
    $(document).on('click', _.bind(function(e) {
      if (!$(e.target).closest(this.$el).length) {
        this.closeDropdown();
      }
    }, this));
  },
  template: _.template($('#dropdown-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  openDropdown: function(e) {
    var btn = $(e.target);
    btn.parent().toggleClass('is-active');
  },
  closeDropdown: function() {
    this.$el.removeClass('is-active');
  },
  selectDropdownOption: function(e) {
    var option = $(e.target);
    option.addClass('is-active')
          .siblings().removeClass('is-active');
    // TODO: persist in localStorage for page refreshes?
    this.updateDropdownTitle(option);
    e.preventDefault();
  },
  updateDropdownTitle: function(optionElm) {
    this.model.set('dropdownTitle', optionElm.text());
    this.render();
  }
});

issueList.FilterView = Backbone.View.extend({
  el: $('.js-issuelist-filter'),
  events: {
    'click button': 'toggleFilter'
  },
  initialize: function() {
    //TODO: move this model out into its own file once we have
    //actual data for issues count

    issueList.events.on('filter:activate', _.bind(this.toggleFilter, this));

    var options = [
      {title: "View all open issues", params: ""},
      {title: "View all issues", params: "filter=all"}
    ];

    // add the dropdown options for logged in users.
    // submitted by me can be
    if ($('body').data('username')) {
      options.push(
        {title: "View issues submitted by me", params: "filter=created"},
        {title: "View issues mentioning me", params: "filter=mentioned"},
        {title: "View issues assigned to me", params: "filter=assigned"}
      );
    }

    this.model = new Backbone.Model({
      dropdownTitle: "View all open issues",
      dropdownOptions: options,
    });

    this.initSubViews();
  },
  initSubViews: function() {
    /* Commenting out for now, see Issues #312, #266
    this.dropdown = new issueList.DropdownView({
      model: this.model
    });
    */
  },
  template: _.template($('#issuelist-filter-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    /* Commenting out for now, see Issues #312, #266
    /* this.dropdown.setElement(this.$el.find('.js-dropdown-wrapper')).render(); */
    return this;
  },
  toggleFilter: function(e) {
    var btn;
    // Stringy e comes from triggered filter:activate event
    if (typeof e === "string") {
      btn = $('[data-filter=' + e + ']');
    } else {
      // We get a regular event object from click events.
      btn = $(e.target);
    }

    btn.toggleClass('is-active')
       .siblings().removeClass('is-active');

    if (btn.hasClass('is-active')) {
      this.updateResults(btn.data('filter'));
    } else {
      this.updateResults();
    }
  },
  updateResults: function(category) {
    issueList.events.trigger('issues:update', category);
  }
});

issueList.SearchView = Backbone.View.extend({
  el: $('.js-issuelist-search'),
  events: {
    'click .js-search-button': 'searchIfNotEmpty'
  },
  keyboardEvents: {
    'enter': 'searchIfNotEmpty'
  },
  initialize: function() {
    issueList.events.on('search:update', _.bind(this.updateSearchQuery, this));
  },
  template: _.template($('#issuelist-search-tmpl').html()),
  render: function(cb) {
    this.$el.html(this.template());
    this.input = this.$el.find('input');

    if (cb && typeof cb === 'function') {
      cb();
    }
    return this;
  },
  updateSearchQuery: function(data) {
    this.input.val(data);
  },
  _isEmpty: true,
  _currentSearch: null,
  searchIfNotEmpty: _.debounce(function(e) {
    var searchValue = e.type === 'click' ? $(e.target).prev().val() :
                      e.target.value;
    if (searchValue.length) {
      this._isEmpty = false;
      // don't search if nothing has changed
      // (or user just added whitespace)
      if ($.trim(searchValue) !== this._currentSearch) {
        this._currentSearch = $.trim(searchValue);
        this.doSearch(this._currentSearch);
      }
    }

    // if it's empty and the user searches, show the default results
    // (but only once)
    if (!searchValue.length && this._currentSearch !== '') {
      this._currentSearch = '';
      this._isEmpty = true;
      issueList.events.trigger('issues:update');
    }
  }, 350),
  doSearch: _.throttle(function(value) {
    if (!this._isEmpty) {
      issueList.events.trigger('issues:update', {query: value});
    }
  }, 500)
});

issueList.SortingView = Backbone.View.extend({
  el: $('.js-issue-sorting'),
  events: {},
  initialize: function() {
    this.paginationModel = new Backbone.Model({
      dropdownTitle: "Show 25",
      dropdownOptions: [
        {title: "Show 25", params: ""},
        {title: "Show 50", params: ""},
        {title: "Show 100", params: ""}
      ]
    });

    this.sortModel = new Backbone.Model({
      dropdownTitle: "Newest",
      dropdownOptions: [
        {title: "Newest", params: ""},
        {title: "Oldest", params: ""},
        {title: "Most Commented", params: ""},
        {title: "etc.", params: ""}
      ]
    });

    this.initSubViews();
  },
  initSubViews: function() {
    /* Commenting out for now, see Issues #312, #266
    this.paginationDropdown = new issueList.DropdownView({
      model: this.paginationModel
    });
    this.sortDropdown = new issueList.DropdownView({
      model: this.sortModel
    }); */
  },
  template: _.template($('#issuelist-sorting-tmpl').html()),
  render: function() {
    this.$el.html(this.template());
    /* Commenting out for now, see Issues #312, #266
    this.paginationDropdown.setElement(this.$el.find('.js-dropdown-pagination')).render();
    this.sortDropdown.setElement(this.$el.find('.js-dropdown-sort')).render(); */
    return this;
  }
});

// we're just listening for and firing events from this view -
// no template needed.
issueList.PaginationControlsView = Backbone.View.extend({
  el: $('.js-pagination-controls'),
  events: {
    'click .js-pagination-previous': 'broadcastPrevious',
    'click .js-pagination-next': 'broadcastNext',
  },
  initialize: function() {

  },
  broadcastNext: function() {
    issueList.events.trigger('paginate:next');
  },
  broadcastPrevious: function() {
    issueList.events.trigger('paginate:previous');
  }
});

issueList.IssueView = Backbone.View.extend({
  el: $('.js-issue-list'),
  events: {
    'click .js-issue-label': 'labelSearch',
  },
  initialize: function() {
    this.issues = new issueList.IssueCollection();
    // check to see if we should pre-filter results
    this.checkParams();

    // set up event listeners.
    issueList.events.on('issues:update', _.bind(this.updateIssues, this));
    issueList.events.on('paginate:next', _.bind(this.requestNextPage, this));
    issueList.events.on('paginate:previous', _.bind(this.requestPreviousPage, this));
  },
  template: _.template($('#issuelist-issue-tmpl').html()),
  checkParams: function() {
    // Assumes a URI like: /?untriaged=1 and activates the untriaged filter,
    // for example.
    var category;
    var filterRegex = /\?(untriaged|needsdiagnosis|contactready|sitewait|closed)=1/;
    if (category = window.location.search.match(filterRegex)) {
      // If there was a match, load the relevant results and fire an event
      // to notify the button to activate.
      this.updateIssues(category[1]);
      _.delay(function() {
        issueList.events.trigger('filter:activate', category[1]);
      }, 0);
    } else {
      // Otherwise, load default issues.
      this.fetchAndRenderIssues();
    }
  },
  fetchAndRenderIssues: function() {
    var headers = {headers: {'Accept': 'application/json'}};
    this.issues.fetch(headers).success(_.bind(function() {
      this.render(this.issues);
      this.initPaginationLinks(this.issues);
    }, this)).error(function(e){
      var message;
      var timeout;
      if (e.responseJSON) {
        message = e.responseJSON.message;
        timeout = e.responseJSON.timeout * 1000;
      } else {
        message = 'Something went wrong!';
        timeout = 3000;
      }

      wcEvents.trigger('flash:error', {message: message, timeout: timeout});
    });
  },
  render: function(issues) {
    this.$el.html(this.template({
      issues: issues.toJSON()
    }));
    return this;
  },
  _isLoggedIn: $('body').data('username'),
  initPaginationLinks: function(issues) {
    // if either the next or previous page numbers are null
    // disable the buttons and add .is-disabled classes.
    var nextButton = $('.js-pagination-next');
    var prevButton = $('.js-pagination-previous');
    var isLastPage = _.bind(function() {
      return this.issues.getNextPageNumber() == null;
    }, this);
    var isFirstPage = _.bind(function() {
      return this.issues.getPreviousPageNumber() == null;
    }, this);
    var isSinglePage = isLastPage() && isFirstPage();

    if (!issues.length || isSinglePage) {
      // hide pagination buttons if there are no results,
      // or the results are limited to a single page.
      nextButton.addClass('wc-hidden');
      prevButton.addClass('wc-hidden');
      return;
    }

    nextButton.removeClass('wc-hidden')
              .prop('disabled', isLastPage())
              .toggleClass('is-disabled', isLastPage());
    prevButton.removeClass('wc-hidden')
              .prop('disabled', isFirstPage())
              .toggleClass('is-disabled', isFirstPage());
  },
  labelSearch: function(e) {
    // clicking on a label in the issues view should trigger a
    // "search:update" event to populate the view with search results
    // for the given label.
    var labelFilter = 'label:' + $(e.target).text();
    if (this._isLoggedIn) {
      issueList.events.trigger('search:update', labelFilter);
    }
    issueList.events.trigger('issues:update', {query: labelFilter});
    e.preventDefault();
  },
  requestNextPage: function() {
    var newUrl;
    if (this.issues.getNextPageNumber()) {
      // chop off the last character, which is the page number
      // TODO: this feels gross. ideally we should get the URL from the
      // link header and send that to an API endpoint which then requests
      // it from GitHub.
      newUrl = this.issues.url.slice(0,-1) + this.issues.getNextPageNumber();
      this.issues.url = newUrl;
      this.fetchAndRenderIssues();
    }
  },
  requestPreviousPage: function() {
    var newUrl;
    if (this.issues.getPreviousPageNumber()) {
      newUrl = this.issues.url.slice(0,-1) + this.issues.getPreviousPageNumber();
      this.issues.url = newUrl;
      this.fetchAndRenderIssues();
    }
  },
  updateIssues: function(category) {
    // depending on what category was clicked (or if a search came in),
    // update the collection instance url property and fetch the issues.
    var labelCategories = ['closed', 'contactready', 'needsdiagnosis', 'sitewait'];

    // note: if query is the empty string, it will load all issues from the
    // '/api/issues' endpoint (which I think we want).
    if (category && category.query) {
      this.issues.url = '/api/issues/search?q=' + category.query + '&page=1';
    } else if (_.contains(labelCategories, category)) {
      this.issues.url = '/api/issues/category/' + category + '?page=1';
    } else if (category === "untriaged") {
      this.issues.url = '/api/issues/search/untriaged?page=1';
    } else {
      this.issues.url = '/api/issues?page=1';
    }
    this.fetchAndRenderIssues();
  }
});

issueList.MainView = Backbone.View.extend({
  el: $('.js-issue-page'),
  events: {},
  initialize: function() {
    this.initSubViews();
  },
  initSubViews: function() {
    this.issueList = new issueList.IssueView();
    this.issueSorter = new issueList.SortingView();
    this.filter = new issueList.FilterView();
    this.paginationControls = new issueList.PaginationControlsView();
    // only init the SearchView if the user is logged in.
    if (this._isLoggedIn) {
      this.search = new issueList.SearchView();
    }

    this.render();
  },
  render: function() {
    //TODO: render filter post-model fetch. See Issue #291.
    this.$el.fadeIn(_.bind(function() {
      this.filter.render();
      this.issueSorter.render();

      if (this._isLoggedIn) {
        this.search.render();
      }
    }, this));
  },
  _isLoggedIn: $('body').data('username')
});

//Not using a router, so kick off things manually
new issueList.MainView();
