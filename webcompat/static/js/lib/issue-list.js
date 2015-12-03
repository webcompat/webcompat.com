/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {};
issueList.events = _.extend({},Backbone.Events);

if (!window.md) {
  window.md = window.markdownit({
    breaks: true,
    html: true,
    linkify: true
  }).use(window.markdownitSanitizer).use(window.markdownitEmoji);
}

issueList.DropdownView = Backbone.View.extend({
  mainView: null,
  events: {
    'click .js-dropdown-toggle': 'openDropdown',
    'click .js-dropdown-options li': 'selectDropdownOption'
  },
  initialize: function(options) {
    this.mainView = options.mainView;
    // this.el is set from parent view via setElement
    // handles closing dropdown when clicking "outside".
    $(document).on('click', _.bind(function(e) {
      if (!$(e.target).closest(this.$el).length) {
        this.closeDropdown();
      }
    }, this));

    issueList.events.on('dropdown:update', _.bind(this.selectDropdownOption, this));
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
    var option;
    var params;

    if (typeof e === 'string') {
      // we received a dropdown:update event and want to update the dropdown, but
      // not broadcast any events (so we don't need "params")
      // $= because some of these will just be the beginning part (mentioned, creator)
      option = $('[data-params$="' + e + '"]');
      this.manuallyUpdateDropdownTitle(option, e);
    } else if (typeof e.type === 'string') {
      // we're dealing with a user click event.
      option = $(e.target);
      params = option.data('params').split(/=/);
      this.mainView.params.setParam(params[0], params[1]);
      this.updateDropdownTitle(option);
      e.preventDefault();
    }

    option.addClass('is-active')
          .siblings().removeClass('is-active');
  },
  manuallyUpdateDropdownTitle: function(optionElm, e) {
    // make sure we're only updating the title if we're operating
    // on the correct model.
    var modelOpts = this.model.get('dropdownOptions');
    if (_.find(modelOpts, function(opt) {
      return opt.params === e;
    }) !== undefined) {
      this.model.set('dropdownTitle', optionElm.text());
      this.render();
    }
  },
  updateDropdownTitle: function(optionElm) {
    this.model.set('dropdownTitle', optionElm.text());
    this.render();
  }
});

issueList.FilterView = Backbone.View.extend({
  el: $('.js-issuelist-filter'),
  mainView: null,
  events: {
    'click .js-filter-button': 'toggleFilter'
  },
  _isLoggedIn: $('body').data('username'),
  _userName: $('body').data('username'),
  initialize: function(options) {
    this.mainView = options.mainView;
    //TODO: move this model out into its own file once we have
    //actual data for issues count
    issueList.events.on('filter:activate', _.bind(this.toggleFilter, this));
    issueList.events.on('filter:clear', _.bind(this.clearFilter, this));

    var optionElms = [
      {title: 'View all Open Issues', params: 'state=open'},
      {title: 'View all Issues', params: 'state=all'}
    ];

    // add the dropdown options for logged in users.
    if (this._isLoggedIn) {
      optionElms.push(
        {title: 'View Issues Submitted by Me', params: 'creator='   + this._userName},
        {title: 'View Issues Mentioning Me',   params: 'mentioned=' + this._userName}
      );
    }

    this.model = new Backbone.Model({
      dropdownTitle: 'View all Open Issues',
      dropdownOptions: optionElms,
    });

    this.initSubViews();
  },
  initSubViews: function() {
    this.dropdown = new issueList.DropdownView({
      model: this.model,
      mainView: this.mainView
    });

  },
  template: _.template($('#issuelist-filter-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.dropdown.setElement(this.$el.find('.js-dropdown-wrapper')).render();
    return this;
  },
  clearFilter: function(options) {
    var btns = $('[data-filter]');
    btns.removeClass('is-active');

    // Remove existing filters from model and URL
    issueList.events.trigger('filter:reset-stage', options);
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

    if (btn.hasClass('is-active')) {
      this.mainView.params.setParam('stage', btn.data('filter'));
    } else {
      this.mainView.params.setParam('stage', '');
    }
  }
});

issueList.SearchView = Backbone.View.extend({
  mainView: null,
  el: $('.js-issuelist-search'),
  events: {
    'click .js-search-button': 'doSearch'
  },
  keyboardEvents: {
    'enter': 'doSearch'
  },
  initialize: function(options) {
    this.mainView = options.mainView;
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
  doSearch: _.debounce(function(e) {
    var searchValue = e.type === 'click' ? $(e.target).prev().val() :
                      e.target.value;
    this.mainView.params.setParam('q', searchValue);
  }, 250),
});

/*
* The applied labels view shows the labels we're filtering by - *excluding*
* status- prefixed labels. These labels can be un-set by clicking their X
* or by focusing them by keyboard and pressing del
*/
issueList.AppliedLabelsView = Backbone.View.extend({
  mainView: null,
  el: $('.wc-AppliedLabels .wc-content'),
  events: {
    'click .wc-Filter--appliedlabel': 'deleteLabel'
  },
  keyboardEvents: {
    'delete': 'deleteLabel'
  },
  initialize: function(options) {
    this.mainView = options.mainView;
    issueList.events.on('appliedlabels:update', _.bind(this.updateAppliedLabels, this));
  },
  template: _.template($('#issuelist-appliedlabels-tmpl').html()),
  updateAppliedLabels: function() {
    var labels = this.mainView.params.get('label');
    this.render({labels:labels});
  },
  render: function(options) {
    this.$el.html(this.template(options));
    return this;
  },
  deleteLabel: function(e) {
    var label = e.target.firstChild.textContent.trim();
    this.mainView.params.deleteLabel(label);
  }
});

issueList.SortingView = Backbone.View.extend({
  mainView: null,
  el: $('.js-issue-sorting'),
  events: {},
  initialize: function(options) {
    this.mainView = options.mainView;
    this.paginationModel = new Backbone.Model({
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
      model: this.paginationModel,
      mainView: this.mainView
    });
    this.sortDropdown = new issueList.DropdownView({
      model: this.sortModel,
      mainView: this.mainView
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

var issuesPagination = new PaginationMixin();

issueList.IssueView = Backbone.View.extend(
  _.extend({}, issuesPagination, {
    mainView: null,
    el: $('.js-issue-list'),
    events: {
      'click .js-issue-label': 'labelSearch',
    },
  // NOTE: these filters don't need "status-" prefixes because appear in URL params
    _isLoggedIn: $('body').data('username'),
    _loadingIndicator: $('.js-loader'),
    _urlParams: undefined,
    initialize: function(options) {
      this.mainView = options.mainView;
      this.issues = new issueList.IssueCollection();

    // set up event listeners.
      issueList.events.on('issues:update', _.bind(this.updateIssues, this));
      issueList.events.on('filter:reset-stage', _.bind(this.resetStageFilter, this));
      wcEvents.on('dropdown:change', _.bind(this.updateModelParams, this));
      window.addEventListener('popstate', _.bind(this.loadIssues, this));

      issuesPagination.initMixin(this, this.issues, $('main'));
      this.loadIssues();
    },
    template: _.template($('#issuelist-issue-tmpl').html()),
    loadIssues: function() {
    // Attemps to load model state from URL params, if present,
    // otherwise grab model defaults and load issues
      this._urlParams = location.search.slice(1);

    // There are some params in the URL
      if (this._urlParams.length !== 0) {
        if (this._urlParams !== this.mainView.params.toDisplayURLQuery()) {
          this.updateModelParams(this._urlParams);
        }
      }
      this.fetchAndRenderIssues();
    },
    fetchAndRenderIssues: function() {
      var headers = {headers: {'Accept': 'application/json'}};

      this.issues.url = this.mainView.params.toBackendURL(this._isLoggedIn);

      this._loadingIndicator.addClass('is-active');
      this.issues.fetch(headers).success(_.bind(function() {
        this._loadingIndicator.removeClass('is-active');
        this.render(this.issues);
        issuesPagination.initPaginationLinks(this.issues);
      }, this)).error(_.bind(function(e) {
        var message;
        var timeout;
        if (e.responseJSON) {
          if (_.startsWith(e.responseJSON, 'API rate limit')) {
          // If we get a client-side Rate Limit error, prompt the
          // user to login and display the message for 60 seconds (by the
          // time it goes away, they can do more requests)
            message = 'Search rate limit exceeded! Please ' +
                    '<a href="/login">login</a> or wait 60 seconds to search again.';
            timeout = 60 * 1000;
          } else {
            message = e.responseJSON.message;
            timeout = e.responseJSON.timeout * 1000;
          }
        } else {
          message = 'Something went wrong!';
          timeout = 3000;
        }

        this._loadingIndicator.removeClass('is-active');
        wcEvents.trigger('flash:error', {message: message, timeout: timeout});
      }, this));
    },
    render: function(issues) {
      this.$el.html(this.template({
        issues: issues.toJSON()
      }));
      return this;
    },
    labelSearch: function(e) {
    // clicking on a label in the issues view should trigger an update
    // listing issues for the given label.
      var target = $(e.target);
      this.mainView.params.setParam('label', target.text());
      e.preventDefault();
    },
    resetStageFilter: function(options) {
      this.updateModelParams('page=1&stage=all', options);
    },
    updateIssues: function() {
    // When this method runs, the code that triggers it must have *already*
    // set all params appropriately.
      this.fetchAndRenderIssues();
    },
    updateModelParams: function(paramsStr) {
    // Params from a query string are merged into the issues model.
      this.mainView.params.fromQueryString(paramsStr);
    },
    updateURLParams: function() {
    // push params from the model back to the URL so it can be used for bookmarks,
    // link sharing, etc.
      var urlParams = this._urlParams;
      var serializedModelParams = this.mainView.params.toDisplayURLQuery();

    // only do this if there's something to change
      if (urlParams !== serializedModelParams) {
        this._urlParams = serializedModelParams;
        if (history.pushState && history.replaceState) {
          if (location.href === '/issues') {
            history.replaceState({}, '', '?' + serializedModelParams);
          } else {
            history.pushState({}, '', '?' + serializedModelParams);
          }
        }
      }
      issueList.events.on('url:update', _.bind(this.updateURLParams, this));
    }
  }));

issueList.MainView = Backbone.View.extend({
  el: $('.js-issue-page'),
  events: {},
  keyboardEvents: {
    'g': 'githubWarp',
    'G': 'githubWarp'
  },
  initialize: function(options) {
    this.params = new issueList.QueryParams(options && options.params);
    this.initSubViews(this);
  },
  githubWarp: function(e) {
    // make sure we're not typing in the search input.
    if (e.target.nodeName === 'INPUT') {
      return;
    }
    e.preventDefault(); // some browsers start inline find
    var warpPipe = 'https://github.com/' + repoPath;
    return location.href = warpPipe;
  },
  initSubViews: function(mainView) {
    this.issueList = new issueList.IssueView({mainView:mainView});
    this.issueSorter = new issueList.SortingView({mainView:mainView});
    this.filter = new issueList.FilterView({mainView:mainView});
    this.search = new issueList.SearchView({mainView:mainView});
    this.appliedLabels = new issueList.AppliedLabelsView({mainView:mainView});

    this.render();
  },
  render: function() {
    //TODO: render filter post-model fetch. See Issue #291.
    this.$el.fadeIn(_.bind(function() {
      this.filter.render();
      this.issueSorter.render();
      this.search.render();
    }, this));
  }
});

//Not using a router, so kick off things manually
new issueList.MainView();
