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
    var target = $(e.target);
    target.closest('.js-dropdown-wrapper').toggleClass('is-active');
  },
  closeDropdown: function() {
    this.$el.removeClass('is-active');
  },
  selectDropdownOption: function(e) {
    var option = $(e.target);
    var params = option.data('params');
    option.addClass('is-active')
          .siblings().removeClass('is-active');

    this.updateDropdownTitle(option);

    // persist value of selection to be used on subsequent page loads
    if ('localStorage' in window) {
      window.localStorage.setItem("params", params);
    }

    // fire an event so other views can react to dropdown changes
    wcEvents.trigger('dropdown:change', params);
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
    'click .js-filter-button': 'toggleFilter'
  },
  _isLoggedIn: $('body').data('username'),
  _userName: $('body').data('username'),
  initialize: function() {
    //TODO: move this model out into its own file once we have
    //actual data for issues count
    issueList.events.on('filter:activate', _.bind(this.toggleFilter, this));
    issueList.events.on('filter:clear', _.bind(this.clearFilter, this));

    var options = [
      {title: 'View all Open Issues', params: 'state=open'},
      {title: 'View all Issues', params: 'state=all'}
    ];

    // add the dropdown options for logged in users.
    if (this._isLoggedIn) {
      options.push(
        {title: 'View Issues Submitted by Me', params: 'creator='   + this._userName},
        {title: 'View Issues Mentioning Me',   params: 'mentioned=' + this._userName}
      );
    }

    this.model = new Backbone.Model({
      dropdownTitle: 'View all Open Issues',
      dropdownOptions: options,
    });

    this.initSubViews();
  },
  initSubViews: function() {
    this.dropdown = new issueList.DropdownView({
      model: this.model
    });

  },
  template: _.template($('#issuelist-filter-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.dropdown.setElement(this.$el.find('.js-dropdown-wrapper')).render();
    return this;
  },
  clearFilter: function() {
    var btns = $('[data-filter]');
    btns.removeClass('is-active');
  },
  toggleFilter: function(e) {
    var btn;
    // Stringy e comes from triggered filter:activate event
    if (typeof e === 'string') {
      btn = $('[data-filter=' + e + ']');
    } else {
      // We get a regular event object from click events.
      btn = $(e.target);
    }

    btn.toggleClass('is-active')
       .siblings().removeClass('is-active');

    // Clear the search field
    issueList.events.trigger('search:clear');

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
    issueList.events.on('search:clear', _.bind(this.clearSearchBox, this));
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
  clearSearchBox: function() {
    this.input.val('');
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
        // clear any filters that have been set.
        issueList.events.trigger('filter:clear');
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
      // TODO(miket): persist selected page limit to survive page loads
      dropdownTitle: 'Show 50',
      dropdownOptions: [
        {title: 'Show 25',  params: 'per_page=25'},
        {title: 'Show 50',  params: 'per_page=50'},
        {title: 'Show 100', params: 'per_page=100'}
      ]
    });

    this.sortModel = new Backbone.Model({
      dropdownTitle: 'Newest',
      dropdownOptions: [
        {title: 'Newest',                 params: 'sort=created&direction=desc'},
        {title: 'Oldest',                 params: 'sort=created&direction=asc'},
        {title: 'Most Commented',         params: 'sort=comments&direction=desc'},
        {title: 'Least Commented',        params: 'sort=comments&direction=asc'},
        {title: 'Recently Updated',       params: 'sort=updated&direction=desc'},
        {title: 'Least Recently Updated', params: 'sort=updated&direction=asc'}
      ]
    });

    this.initSubViews();
  },
  initSubViews: function() {
    this.paginationDropdown = new issueList.DropdownView({
      model: this.paginationModel
    });
    this.sortDropdown = new issueList.DropdownView({
      model: this.sortModel
    });
  },
  template: _.template($('#issuelist-sorting-tmpl').html()),
  render: function() {
    this.$el.html(this.template());
    this.paginationDropdown.setElement(this.$el.find('.js-dropdown-pagination')).render();
    this.sortDropdown.setElement(this.$el.find('.js-dropdown-sort')).render();
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
  _isLoggedIn: $('body').data('username'),
  _loadingIndicator: $('.js-loader'),
  _pageLimit: null,
  initialize: function() {
    this.issues = new issueList.IssueCollection();
    // check to see if we should pre-filter results
    // otherwise load default (unfiltered "all")
    this.loadIssues();

    // set up event listeners.
    issueList.events.on('issues:update', _.bind(this.updateIssues, this));
    issueList.events.on('paginate:next', _.bind(this.requestNextPage, this));
    issueList.events.on('paginate:previous', _.bind(this.requestPreviousPage, this));
    wcEvents.on('dropdown:change', _.bind(this.updateModelParams, this));
  },
  template: _.template($('#issuelist-issue-tmpl').html()),
  loadIssues: function() {
    // First checks URL params, e.g., /?untriaged=1 and activates the untriaged filter,
    // or loads default unsorted/unfiltered issues
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
  getPageLimit: function() {
    return this._pageLimit;
  },
  render: function(issues) {
    this.$el.html(this.template({
      issues: issues.toJSON()
    }));
    return this;
  },
  initPaginationLinks: function(issues) {
    // if either the next or previous page numbers are null
    // disable the buttons and add .is-disabled classes.
    var nextButton = $('.js-pagination-next');
    var prevButton = $('.js-pagination-previous');
    var isLastPage = _.bind(function() {
      return this.issues.getNextPage() == null;
    }, this);
    var isFirstPage = _.bind(function() {
      return this.issues.getPrevPage() == null;
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
    var nextPage;
    if (nextPage = this.issues.getNextPage()) {
      // we pass along the entire URL from the Link header
      this.fetchAndRenderIssues({url: nextPage});
    }
  },
  requestPreviousPage: function() {
    var prevPage;
    if (prevPage = this.issues.getPrevPage()) {
      // we pass along the entire URL from the Link header
      this.fetchAndRenderIssues({url: prevPage});
    }
  },
  updateIssues: function(category) {
    // depending on what category was clicked (or if a search came in),
    // update the collection instance url property and fetch the issues.

    // note: until GitHub fixes a bug where requesting issues filtered by labels
    // doesn't return pagination via Link, we get those results via the Search API.
    var searchCategories = ['untriaged', 'contactready', 'needsdiagnosis', 'sitewait'];
    var params = $.extend(this.issues.params, this.getPageLimit());

    // note: if query is the empty string, it will load all issues from the
    // '/api/issues' endpoint (which I think we want).
    if (category && category.query) {
      params = $.extend(params, {q: category.query});
      this.issues.setURLState('/api/issues/search', params);
    } else if (_.contains(searchCategories, category)) {
      this.issues.setURLState('/api/issues/search/' + category, params);
    } else if (category === "closed") {
      this.issues.setURLState('/api/issues/category/' + category, params);
    } else {
      this.issues.setURLState('/api/issues', params);
    }
    this.fetchAndRenderIssues();
  },
  updateModelParams: function(params) {
    // convert params string to an array,
    // splitting on & in case of multiple params
    var paramsArray = params.split('&');

    // paramsArray is an array of param 'key=value' string pairs,
    _.forEach(paramsArray, _.bind(function(param) {
      var kvArray = param.split('=');
      var key = kvArray[0];
      var value = kvArray[1];
      this.issues.params[key] = value;

      if (key === 'per_page') {
        this._pageLimit = value;
      }
    }, this));

    this.fetchAndRenderIssues();
  }
});

issueList.MainView = Backbone.View.extend({
  el: $('.js-issue-page'),
  events: {},
  keyboardEvents: {
    'g': 'githubWarp',
    'G': 'githubWarp'
  },
  initialize: function() {
    this.initSubViews();
  },
  githubWarp: function() {
    var warpPipe = "http://github.com/" + repoPath;
    return location.href = warpPipe;
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
