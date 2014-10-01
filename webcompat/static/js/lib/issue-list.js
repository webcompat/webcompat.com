/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {};
issueList.events = _.extend({},Backbone.Events);

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  url: '/api/issues'
});

issueList.FilterView = Backbone.View.extend({
  el: $('.js-issuelist-filter'),
  events: {
    'click .js-dropdown-toggle': 'openDropdown',
    'click .js-dropdown-options li': 'selectDropdownOption',
    'click .js-issue-filter': 'applyFilter'
  },
  initialize: function() {
    //TODO: move this model out into its own file once we have
    //actual data for issues count
    this.model = new Backbone.Model();
    this.model.set('dropdownTitle', '');

    // handle closing dropdown when clicking "outside".
    $(document).on('click', _.bind(function(e) {
      if (!$(e.target).closest('.js-dropdown-wrapper').length) {
        this.closeDropdown();
      }
    }, this));
  },
  template: _.template($('#issuelist-filter-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  applyFilter: function(e) {
    var btn = $(e.target);
    btn.addClass('is-active')
       .siblings().removeClass('is-active');
    // TODO: apply filter to search
  },
  closeDropdown: function() {
    $('.js-dropdown-wrapper').removeClass('is-active');
  },
  openDropdown: function(e) {
    var btn = $(e.target);
    btn.parent().toggleClass('is-active');
  },
  selectDropdownOption: function(e) {
    var option = $(e.target);
    option.addClass('is-active')
          .siblings().removeClass('is-active');
    // persist in localStorage for page refreshes?
    this.updateDropdownTitle(option);
    issueList.events.trigger('searchinput:update');
    e.preventDefault();

  },
  updateDropdownTitle: function(optionElm) {
    var prefixed = "issues ";
    var selectedOption = optionElm ?
        optionElm : $('.js-dropdown-options li.is-active');
    var title = selectedOption.text().toLowerCase();
    if (selectedOption.data('prefixTitle')) {
      title = prefixed + title;
    }
    this.model.set('dropdownTitle', title);
    this.render();
  }
});

issueList.IssueView = Backbone.View.extend({
  el: $('.js-issue-list'),
  initialize: function() {
    var self = this;
    var headers = {headers: {'Accept': 'application/json'}};
    this.issues = new issueList.IssueCollection();
    this.issues.fetch(headers).success(function() {
      self.render();
    }).error(function(e){console.log(e);});
  },
  template: _.template($('#issuelist-issue-tmpl').html()),
  render: function() {
    this.$el.html(this.template({
      //can deal with "show N issues" either manually,
      //or request paginated results with N per page.
      //former more work, latter more API requests
      issues: this.issues.toJSON()
    }));
    return this;
  }
});

issueList.MainView = Backbone.View.extend({
  el: $('.js-issue-page'),
  events: {},
  keyboardEvents: {},
  initialize: function() {
    this.initSubViews();
  },
  initSubViews: function() {
    this.issueList = new issueList.IssueView();
    this.filter = new issueList.FilterView();
    this.render();
  },
  render: function() {
    //TODO: render filter post-model fetch. See Issue #291.
    this.$el.fadeIn(_.bind(function() {
      this.filter.render();
      this.filter.updateDropdownTitle();
    }, this));
  }
});

//Not using a router, so kick off things manually
new issueList.MainView();
