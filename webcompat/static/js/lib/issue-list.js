/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issueList = issueList || {}; // eslint-disable-line no-use-before-define
issueList.events = _.extend({},Backbone.Events);

if (!window.md) {
  window.md = window.markdownit({
    breaks: true,
    html: true,
    linkify: true
  }).use(window.markdownitSanitizer).use(window.markdownitEmoji);
}

issueList.DropdownView = Backbone.View.extend({
  events: {
    "click .js-Dropdown-toggle": "openDropdown",
    "click .js-Dropdown-options li": "selectDropdownOption"
  },
  initialize: function() {
    // this.el is set from parent view via setElement
    // handles closing dropdown when clicking "outside".
    $(document).on("click", _.bind(function(e) {
      if (!$(e.target).closest(this.$el).length) {
        this.closeDropdown();
      }
    }, this));

    issueList.events.on("dropdown:update", _.bind(this.selectDropdownOption, this));
  },
  template: _.template($("#dropdown-tmpl").html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  openDropdown: function(e) {
    var target = $(e.target);
    target.closest(".js-Dropdown").toggleClass("is-active");
  },
  closeDropdown: function() {
    this.$el.removeClass("is-active");
  },
  selectDropdownOption: function(e) {
    var option;
    var params;

    if (typeof e === "string") {
      // we received a dropdown:update event and want to update the dropdown, but
      // not broadcast any events (so we don't need "params")
      // $= because some of these will just be the beginning part (mentioned, creator)
      option = $("[data-params$=\"" + e + "\"]");
      this.manuallyUpdateDropdownTitle(option, e);
    } else if (typeof e.type === "string") {
      // we're dealing with a user click event.
      option = $(e.target);
      params = option.data("params");

      // fire an event so other views can react to dropdown changes
      wcEvents.trigger("dropdown:change", params, {update: true});
      this.updateDropdownTitle(option);
      e.preventDefault();
    }

    option.addClass("is-active")
          .siblings().removeClass("is-active");
  },
  manuallyUpdateDropdownTitle: function(optionElm, e) {
    // make sure we're only updating the title if we're operating
    // on the correct model.
    var modelOpts = this.model.get("dropdownOptions");
    if (_.find(modelOpts, function(opt) {
      return opt.params === e;
    }) !== undefined) {
      this.model.set("dropdownTitle", optionElm.text());
      this.render();
    }
  },
  updateDropdownTitle: function(optionElm) {
    this.model.set("dropdownTitle", optionElm.text());
    this.render();
  }
});

issueList.FilterView = Backbone.View.extend({
  el: $(".js-SearchIssue-filter"),
  events: {
    "click .js-Tag": "toggleFilter"
  },
  _isLoggedIn: $("body").data("username"),
  _userName: $("body").data("username"),
  initialize: function() {
    //TODO: move this model out into its own file once we have
    //actual data for issues count
    issueList.events.on("filter:activate", _.bind(this.toggleFilter, this));
    issueList.events.on("filter:clear", _.bind(this.clearFilter, this));

    var options = [
      {title: "View all Open Issues", params: "state=open"},
      {title: "View all Issues", params: "state=all"}
    ];

    // add the dropdown options for logged in users.
    if (this._isLoggedIn) {
      options.push(
        {title: "View Issues Submitted by Me", params: "creator="   + this._userName},
        {title: "View Issues Mentioning Me",   params: "mentioned=" + this._userName}
      );
    }

    this.model = new Backbone.Model({
      dropdownTitle: "View all Open Issues",
      dropdownOptions: options,
    });

    this.initSubViews();
  },
  initSubViews: function() {
    this.dropdown = new issueList.DropdownView({
      model: this.model
    });

  },
  template: _.template($("#issuelist-filter-tmpl").html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.dropdown.setElement(this.$el.find(".js-Dropdown")).render();
    return this;
  },
  clearFilter: function(options) {
    var btns = $("[data-filter]");
    btns.removeClass("is-active");

    // Remove existing filters from model and URL
    issueList.events.trigger("filter:reset-stage", options);
  },
  toggleFilter: function(e) {
    var btn;
    var filterParam;
    // Stringy e comes from triggered filter:activate event
    if (typeof e === "string") {
      btn = $("[data-filter=" + e + "]");
    } else {
      // We get a regular event object from click events.
      btn = $(e.target);
    }

    btn.toggleClass("is-active")
       .siblings().removeClass("is-active");

    // Clear the search field
    issueList.events.trigger("search:clear");

    if (btn.hasClass("is-active")) {
      filterParam = "stage=" + btn.data("filter");
      issueList.events.trigger("issues:update", btn.data("filter"));
      issueList.events.trigger("filter:add-to-model", filterParam, {removeQ: true});
    } else {
      // Remove existing filters from model and URL
      issueList.events.trigger("filter:reset-stage", {removeQ: true});
      issueList.events.trigger("issues:update");
    }
  }
});

issueList.SearchView = Backbone.View.extend({
  el: $(".js-SearchForm"),
  events: {
    "click .js-SearchForm-button": "searchIfNotEmpty"
  },
  keyboardEvents: {
    "enter": "searchIfNotEmpty"
  },
  initialize: function() {
    issueList.events.on("search:update", _.bind(this.updateSearchQuery, this));
    issueList.events.on("search:clear", _.bind(this.clearSearchBox, this));
  },
  template: _.template($("#issuelist-search-tmpl").html()),
  render: function(cb) {
    this.$el.html(this.template());
    this.input = this.$el.find("input");

    if (cb && typeof cb === "function") {
      cb();
    }
    return this;
  },
  clearSearchBox: function() {
    this.input.val("");
  },
  updateSearchQuery: function(data) {
    this.input.val(data);
  },
  _isEmpty: true,
  _currentSearch: null,
  searchIfNotEmpty: _.debounce(function(e) {
    var searchValue = e.type === "click" ? $(e.target).prev().val() :
                      e.target.value;
    if (searchValue.length) {
      this._isEmpty = false;
      // don't search if nothing has changed
      // (or user just added whitespace)
      if ($.trim(searchValue) !== this._currentSearch) {
        this._currentSearch = $.trim(searchValue);
        this.doSearch(this._currentSearch);
        // clear any filters that have been set.
        issueList.events.trigger("filter:clear", {removeQ: false});
      }
    }

    // if it's empty and the user searches, show the default results
    // (but only once)
    if (!searchValue.length && this._currentSearch !== "") {
      this._currentSearch = "";
      this._isEmpty = true;
      issueList.events.trigger("issues:update");
    }
  }, 350),
  doSearch: _.throttle(function(value) {
    if (!this._isEmpty) {
      issueList.events.trigger("issues:update", {query: value});
    }
  }, 500)
});

issueList.SortingView = Backbone.View.extend({
  el: $(".js-SearchIssue-sorting"),
  events: {},
  initialize: function() {
    this.paginationModel = new Backbone.Model({
      dropdownTitle: "Show 50",
      dropdownOptions: [
        {title: "Show 25",  params: "per_page=25"},
        {title: "Show 50",  params: "per_page=50"},
        {title: "Show 100", params: "per_page=100"}
      ]
    });

    this.sortModel = new Backbone.Model({
      dropdownTitle: "Newest",
      dropdownOptions: [
        {title: "Newest",                 params: "sort=created&direction=desc"},
        {title: "Oldest",                 params: "sort=created&direction=asc"},
        {title: "Most Commented",         params: "sort=comments&direction=desc"},
        {title: "Least Commented",        params: "sort=comments&direction=asc"},
        {title: "Recently Updated",       params: "sort=updated&direction=desc"},
        {title: "Least Recently Updated", params: "sort=updated&direction=asc"}
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
  template: _.template($("#issuelist-sorting-tmpl").html()),
  render: function() {
    this.$el.html(this.template());
    this.paginationDropdown.setElement(this.$el.find(".js-Dropdown-pagination")).render();
    this.sortDropdown.setElement(this.$el.find(".js-Dropdown-sort")).render();
    return this;
  }
});

var issuesPagination = new PaginationMixin();

issueList.IssueView = Backbone.View.extend(
  _.extend({}, issuesPagination, {
    el: $(".js-list-issue"),
    events: {
      "click .js-Issue-label .wc-Labels": "labelSearch",
    },
  // NOTE: these filters don't need "status-" prefixes because appear in URL params
    _filterRegex: /&*stage=(closed|contactready|needscontact|needsdiagnosis|needstriage|sitewait)&*/i,
    _searchRegex: /&*q=(?:(.+)?)&*/i,
    _githubSearchEndpoint: "https://api.github.com/search/issues",
    _isLoggedIn: $("body").data("username"),
    _loadingIndicator: $(".js-Loader"),
    _urlParams: undefined,
    initialize: function() {
      this.issues = new issueList.IssueCollection();

    // set up event listeners.
      issueList.events.on("issues:update", _.bind(this.updateIssues, this));
      issueList.events.on("filter:add-to-model", _.bind(this.updateModelParams, this));
      issueList.events.on("filter:reset-stage", _.bind(this.resetStageFilter, this));
      wcEvents.on("dropdown:change", _.bind(this.updateModelParams, this));
      window.addEventListener("popstate", _.bind(this.loadIssues, this));

      issuesPagination.initMixin(this, this.issues, $("main"));
      this.loadIssues();
    },
    template: _.template($("#issuelist-issue-tmpl").html()),
    loadIssues: function() {
    // Attemps to load model state from URL params, if present,
    // otherwise grab model defaults and load issues
      var category;
      var queryMatch;

      this._urlParams = location.search.slice(1);
      var urlParams = this._urlParams;

    // There are some params in the URL
      if (urlParams.length !== 0) {
        queryMatch = urlParams.match(this._searchRegex);
        if (!this._isLoggedIn && queryMatch) {
        // We're dealing with an un-authed user, with a q param.
          this.doGitHubSearch(urlParams);
          this.updateModelParams(urlParams);
          _.delay(function() {
          // TODO: update search input from query param for authed users.
            issueList.events.trigger("search:update", queryMatch[1]);
          }, 0);
        } else if (category = window.location.search.match(this._filterRegex)) {
        // If there was a stage filter match, fire an event which loads results
          this.updateModelParams(urlParams);
          _.delay(function() {
            issueList.events.trigger("filter:activate", category[1]);
          }, 0);
        } else {
        // Only bother to update/merge model params if we're not loading the defaults
          if (urlParams !== $.param(this.issues.params)) {
            this.updateModelParams(urlParams);
          }
          this.fetchAndRenderIssues();
        }
      } else {
      // There are no params in the URL, load the defaults
        this.updateURLParams();
        this.fetchAndRenderIssues();
      }
    },
    doGitHubSearch: function(params) {
    // Bypass our server and request GitHub search results (from the client)
    // to avoid being penalized for unauthed Search API requests.
      var gitHubSearchURL = this._githubSearchEndpoint + "?" +
                          $.param(this.issues.normalizeAPIParams(params));
      this.fetchAndRenderIssues({url: gitHubSearchURL});
    },
    fetchAndRenderIssues: function(options) {
      var headers = {headers: {"Accept": "application/json"}};
      if (options && options.url) {
        this.issues.url = options.url;
      } else {
        this.issues.url = this.issues.path + "?" + $.param(this.issues.params);
      }

      this._loadingIndicator.addClass("is-active");
      this.issues.fetch(headers).success(_.bind(function() {
        this._loadingIndicator.removeClass("is-active");
        this.render(this.issues);
        issuesPagination.initPaginationLinks(this.issues);
      }, this)).error(_.bind(function(e) {
        var message;
        var timeout;
        if (e.responseJSON) {
          if (_.startsWith(e.responseJSON, "API rate limit")) {
          // If we get a client-side Rate Limit error, prompt the
          // user to login and display the message for 60 seconds (by the
          // time it goes away, they can do more requests)
            message = "Search rate limit exceeded! Please " +
                    "<a href=\"/login\">login</a> or wait 60 seconds to search again.";
            timeout = 60 * 1000;
          } else {
            message = e.responseJSON.message;
            timeout = e.responseJSON.timeout * 1000;
          }
        } else {
          message = "Something went wrong!";
          timeout = 3000;
        }

        this._loadingIndicator.removeClass("is-active");
        wcEvents.trigger("flash:error", {message: message, timeout: timeout});
      }, this));
    },
    render: function(issues) {
      this.$el.html(this.template({
        issues: issues.toJSON()
      }));
      return this;
    },
    labelSearch: function(e) {
    // clicking on a label in the issues view should trigger a
    // "search:update" event to populate the view with search results
    // for the given label.
      var target = $(e.target);
      var clickedLabel = target.data("remotename");
      var labelFilter = "label:" + clickedLabel;
      issueList.events.trigger("search:update", labelFilter);
      issueList.events.trigger("issues:update", {query: labelFilter});
      issueList.events.trigger("filter:clear", {removeQ: false});
      e.preventDefault();
    },
    resetStageFilter: function(options) {
      this.updateModelParams("page=1&stage=all", options);
    },
    updateIssues: function(category) {
    // depending on what category was clicked (or if a search came in),
    // update the collection instance url property and fetch the issues.

      var issuesAPICategories = ["closed", "contactready", "needscontact",
        "needsdiagnosis", "needstriage", "sitewait"];
      var params = this.issues.params;
      var paramsCopy;
    // note: if query is the empty string, it will load all issues from the
    // '/api/issues' endpoint (which I think we want).
      if (category && category.query) {
      // first, add the query to the underlying model, then make a copy of that
      // which can be manipulated by doGitHubSearch without affecting the params
      // that are pushed back to the URL bar.
        paramsCopy = _.cloneDeep($.extend(params, {q: category.query}));
        if (!this._isLoggedIn) {
          this.doGitHubSearch(paramsCopy);
          return;
        } else {
          this.issues.setURLState("/api/issues/search", paramsCopy);
        }
      } else if (_.contains(issuesAPICategories, category)) {
        this.issues.setURLState("/api/issues/category/" + category, params);
      } else {
        this.issues.setURLState("/api/issues", params);
      }

      this.fetchAndRenderIssues();
    },
    addParamsToModel: function(paramsArray) {
    // this method just puts the params in the model's params property.
    // paramsArray is an array of param 'key=value' string pairs
      _.forEach(paramsArray, _.bind(function(param) {
        var kvArray = param.split("=");
        var key = kvArray[0];
        var value = kvArray[1];
        this.issues.params[key] = value;
      }, this));
    },
    updateModelParams: function(params, options) {
    // we convert the params string into an array, splitting
    // on '&' in case of multiple params. those are then
    // merged into the issues model.

      var hasPerPageChange = params.indexOf("per_page") !== -1;
      var hasSortChange = params.indexOf("sort") !== -1;

    // call _.uniq() on it to ignore duplicate values
      var paramsArray = _.uniq(params.split("&"));

      if (options && options.removeQ === true) {
        delete this.issues.params["q"];
      }

      this.addParamsToModel(paramsArray);

    //broadcast to each of the dropdowns that they need to update
      var pageDropdown;
      if (hasPerPageChange) {
        pageDropdown = "per_page=" + this.issues.params.per_page;
        _.delay(function() {
          issueList.events.trigger("dropdown:update", pageDropdown);
        }, 0);
      }

      var sortDropdown;
    // all the sort options begin with sort, and end with direction.
      if (hasSortChange) {
        sortDropdown = "sort=" + this.issues.params.sort + "&direction=" + this.issues.params.direction;
        _.delay(function() {
          issueList.events.trigger("dropdown:update", sortDropdown);
        }, 0);
      }

    // make sure we prevent more than one mutually-exclusive state param
    // in the model, because that's weird. the "last" param will win.
      var currentStateParamName;
      var stateParamsSet = ["state", "creator", "mentioned"];
      var stateParam = _.find(paramsArray, function(paramString) {
        return _.find(stateParamsSet, function(stateParam) {
          if (paramString.indexOf(stateParam) === 0) {
            return currentStateParamName = stateParam;
          }
        });
      });

      if (stateParam !== undefined) {
      // delete the non-current state params from the stateParamsSet
        var toDelete = _.without(stateParamsSet, currentStateParamName);
        _.forEach(toDelete, _.bind(function(param) {
          delete this.issues.params[param];
        }, this));

        if (currentStateParamName in this.issues.params) {
          _.delay(function() {
            issueList.events.trigger("dropdown:update", stateParam);
          }, 0);
        }
      }

      this.updateURLParams();
    // only re-request issues if explicitly asked to
      if (options && options.update === true) {
        this.fetchAndRenderIssues();
      }
    },
    updateURLParams: function() {
    // push params from the model back to the URL so it can be used for bookmarks,
    // link sharing, etc.
      var urlParams = this._urlParams;
      var serializedModelParams = $.param(this.issues.params);

    // only do this if there's something to change
      if (urlParams !== serializedModelParams) {
        this._urlParams = serializedModelParams;
        if (history.pushState) {
          history.pushState({}, "", "?" + serializedModelParams);
        }
      }
    }
  }));

issueList.MainView = Backbone.View.extend({
  el: $(".js-SearchIssue"),
  events: {},
  keyboardEvents: {
    "g": "githubWarp",
    "G": "githubWarp"
  },
  initialize: function() {
    this.initSubViews();
  },
  githubWarp: function(e) {
    // make sure we're not typing in the search input.
    if (e.target.nodeName === "INPUT") {
      return;
    }
    e.preventDefault();
    var warpPipe = "https://github.com/" + repoPath;
    return location.href = warpPipe;
  },
  initSubViews: function() {
    this.issueList = new issueList.IssueView();
    this.issueSorter = new issueList.SortingView();
    this.filter = new issueList.FilterView();
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
