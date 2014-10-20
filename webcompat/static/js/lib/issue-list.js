/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {};
issueList.events = _.extend({},Backbone.Events);

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  url: '/api/issues'
});

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
  toggleFilter: function(e) {
    var btn = $(e.target);
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
  keyboardEvents: {
    'enter': 'doSearch'
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
  doSearch: function(e) {
    console.log('Search for: ', e.target.value);
  }
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

issueList.IssueView = Backbone.View.extend({
  el: $('.js-issue-list'),
  initialize: function() {
    this.issues = new issueList.IssueCollection();
    this.fetchAndRenderIssues();

    issueList.events.on('issues:update', _.bind(this.updateIssues, this));
  },
  template: _.template($('#issuelist-issue-tmpl').html()),
  fetchAndRenderIssues: function() {
    var headers = {headers: {'Accept': 'application/json'}};
    this.issues.fetch(headers).success(_.bind(function() {
      this.render(this.issues);
    }, this)).error(function(e){console.log(e);});
  },
  render: function(issues) {
    this.$el.html(this.template({
      //can deal with "show N issues" either manually,
      //or request paginated results with N per page.
      //former more work, latter more API requests
      issues: issues.toJSON()
    }));
    return this;
  },
  updateIssues: function(category) {
    // depending on what category was clicked, update the collection instance
    // url property and fetch the issues.
    var labelCategories = ['closed', 'contactready', 'needsdiagnosis', 'sitewait'];
    if (_.contains(labelCategories, category)) {
      this.issues.url = '/api/issues/category/' + category;
    } else if (category === "untriaged") {
      this.issues.url = 'api/issues/search/untriaged';
    } else {
      // else we've toggled "off" a filter. display everything again.
      this.issues.url = '/api/issues';
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
    this.filter = new issueList.FilterView();
    this.issueSorter = new issueList.SortingView();
    this.search = new issueList.SearchView();
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
