/*globals issues*/
var issueList = issueList || {}; // eslint-disable-line no-use-before-define

/*
* QueryParams is a model for keeping track of all parameters
* we need to fetch the list of issues.
*
* Dropdown, filter, search and sorting views will update the params,
* typically by calling
* this.mainView.params.setParam(name, value).
* The QueryParams model will observe itself and trigger relevant
* updates to the various views through firing events.
*
* The model can serialize its params to generate URLs. Queries are
* either proxied through webcompat.com or go directly to GitHub.
*
* If the request is a simple query (no search terms / ?q= parameter),
* it is always proxied through webcompat and the backend uses GitHub's
* Issues API - https://developer.github.com/v3/issues/
* Generated URLs are for example
* /api/issues?page=1&per_page=50&sort=created&direction=desc
* /api/issues/needsdiagnosis?page=1&per_page=50&sort=created&direction=desc
*
* If the request has a search query, and the user is logged in,
* it is also proxied through webcompat and the backend uses GitHub's
* Search API - https://developer.github.com/v3/search/#search-issues
*
* If the request has a search query and the user is *not* logged in,
* we send the query directly to GitHub's CORS-enabled Search API.
* Generated URLs are for example
* https://api.github.com/search/issues?q=foo&sort=created&order=desc
*
* The query itself can contain name:value parts like label:state-needsdiagnosis
* but we have no control over paging and number of results when querying
* GitHub directly.
*/
issueList.QueryParams = Backbone.Model.extend({
  defaults: {
    stage: "all",
    state: "open",
    page: 1,
    per_page: 50,
    sort: "created",
    direction: "desc",
    q: "",
    creator: "",
    mentioned: "",
    labels: []
  },
  configUrls: {
    _githubSearch: "https://api.github.com/search/issues"
  },
  bugstatuses: ["contactready", "needscontact", "needsdiagnosis", "needstriage", "sitewait"],
  initialize: function() {
    this.on("change", function(e) {
      // When the query/parameters change, we want to
      // * update the drop-down menu if required
      // * update the URL and push a history entry
      // * update the relevant views (list of issues, search box)
      // To do so, this method will fire various events.
      // However, first we want to check if the change is significant.
      var significant = false;
      var changelist = Object.keys(e.changed);
      for (var i = 0, change; change = changelist[i]; i++) {
        // I think we only get notified of one property at a time so looping is
        // maybe not necessary here.
        var newvalue = e.changed[change];
        var oldvalue = e.previousAttributes()[change];
        if (newvalue.toString().trim() === oldvalue.toString().trim()) {
          continue; // just whitespace change, let's ignore this
        }
        // If a user clicks a label we're already filtering by, we can likewise ignore it
        if (change === "labels") {
          if (this.get("labels").indexOf(newvalue) > -1) {
            continue;
          }
        }
        // End of "ignore insignificant updates" logic
        // so, we think this change matters and want to send update notifications to
        // the UI
        significant = true;
        if (change === "per_page" || change === "state") {
          issueList.events.trigger("dropdown:update", change + "=" + newvalue);
        } else if (change === "sort" || change === "direction") {
          issueList.events.trigger("dropdown:update", "sort=" +
              this.attributes.sort + "&direction=" + this.attributes.direction);
        } else if (change === "q") {
          issueList.events.trigger("search:update", newvalue);
        }
      }
      if (significant) {
        issueList.events.trigger("issues:update");
      }
    });
  },
  /*
  * This creates a query suitable for the URL bar from the current params
  */
  toDisplayURLQuery: function() {
    var urlParams = [];
    _.each(this.attributes, function(value, key) {
      if (value) {
        urlParams.push(key + "=" + value);
      }
    });
    return urlParams.join("&");
  },
  toBackendURL: function(loggedIn) {
    /*
    * This method returns either a GitHub API URL or a webcompat.com/api URL
    * depending on the login status and what type of query we run.
    * Some queries go directly to GitHub's CORS-enabled backend,
    * some are proxied on webcompat.com :
    * /api/issues/category/<category> (new|closed|status label)
    * /api/issues/search/ - with ?q argument CAVEAT: stage/state must also be in ?q
    * /api/issues/search/category/<category>
    *
    * Choosing a backend depends on logged-in status and whether we have
    * a search query. If the visitor is not logged in and we do have a
    * search query, the request goes direct to GitHub. Otherwise (but why?)
    * it is proxied.
    *
    * Basically, we have three kinds of input:
    *   * Stage: client-side this is added to the pathname. On the backend it's
    *     transformed to a label:status-foo string and added to q
    *     (a bit complex but I hope the API vainly loves the prettier URLs)
    *
    *   * Keywords that go into separate URL arguments - direction, sort, page, per_page
    *
    *   * Certain others need to go into q= field, as name:value - this is more common for the
    *     search API than the issues API
    */
    var url;
    var issuesAPICategories = ["closed"].concat(this.bugstatuses);

    // Rules for when to use GitHub directly and when Webcompat
    var q = this.get("q");
    // TODO: can be simplified if we bring back AppliedLabels view, this next line should go
    // we know that the issue API can handle queries with labels in, we don't want a labels:foo
    // in the search field to force the search API.
    q = q.replace(/labels:[^ ]+/g, "");
    if (q) { // We have a query that needs search API
      if ("withCredentials" in XMLHttpRequest.prototype && !loggedIn) { // CORS support, not logged in - talk directly to GH
        url = this.configUrls._githubSearch + "?" + this.toSearchAPIParams();
      } else {
        url = "/api/issues/search" + "?" + this.toSearchAPIParams();
      }
    } else { // Seems like this query is so simple we only need the issues API.
      if (_.contains(issuesAPICategories, this.get("stage"))) {
        url = "/api/issues/category/" + this.get("stage") + "?" + this.toIssueAPIParams();
      } else {
        url = "/api/issues" + "?" + this.toIssueAPIParams();
      }
    }
    return url;
  },
  toIssueAPIParams: function() {
    /* Serializes the parameters for the GitHub issues API.
    *
    * https://developer.github.com/v3/issues/
    */
    // Simple: serialize our attributes, remove any empty values
    // Note: this method works best for webcompat-proxied URLs,
    // especially since we make no attempt at translating stage
    // property to labels - this happens at the backend..
    var paramsToSend = _.clone(this.attributes);
    for (var property in paramsToSend) { // we want to ignore empty values
      if (!(paramsToSend[property])) {
        delete paramsToSend[property];
      }
    }
    // also drop label= if we don't filter by label
    if (paramsToSend.labels.length) {
      // gotcha: issues API needs labels in plural, search API in singular.. :-/
      paramsToSend.labels = issues.allLabels.toPrefixed(paramsToSend.labels);
    } else {
      delete paramsToSend.labels;
    }
    return $.param(paramsToSend, true);
  },
  toSearchAPIParams: function() {
    /* Serializes the parameters for the GitHub search API.
    *
    * The GitHub search API is documented here:
    * https://developer.github.com/v3/search/
    *
    * Here we only have the arguments ?q= &sort= &order=
    * but within the q string we can add several name:value parts, in particular
    *   author, mentions, state, label (several), repo
    * We can also negate by prefixing these with -.
    */
    var paramsToSend = _.pick(this.attributes, "q", "sort");
    var key;
    // Some names are different for the search API..
    if (this.get("direction")) {
      paramsToSend.order = this.get("direction");
    }
    // These properties must end up as ?q=name:value with name slightly translated
    var qMap = {
      creator:   "author",
      mentioned: "mentions"
    };
    for (key in qMap) {
      if (this.get(key)) {
        paramsToSend.q += " " + qMap[key] + ":" + this.get("key");
      }
    }
    if (this.get("labels").length) {
      var theLabels = issues.allLabels.toPrefixed(this.get("labels"));
      // gotcha: issues API needs labels in plural, search API in singular.. :-/
      paramsToSend.q += " label:" + theLabels.join(" label:");
    }
    if (this.get("stage") && !(this.get("stage") in {all:1,closed:1})) {
      paramsToSend.q += " label:status-" + this.get("stage");
    }
    paramsToSend.q += " state:" + this.get("state");
    // Scope this to our issues repo.
    paramsToSend.q += " repo:" + repoPath.slice(0,-7);

    return $.param(paramsToSend, true);
  },

  setParam: function(name, value, silent) {
    // Because we query two separate GitHub APIs, which use slightly different keywords,
    // we have two names for some of the params - let's limit it to one name internally
    if (name === "order") {
      name = "direction";
    }
    // Sometimes - in particular if a request to the backend fails - we want
    // to reset the model back to previous values without triggering a new change
    // event and a corresponding backend request.
    var options = {silent:!!silent};

    // if the q parameter is set, the value might contain name:value params
    // for consistency, we should do a bit of parsing and extract those..
    // Both API and UI will be more confusing if we allow both label:foo inside search
    // AND label: ['bar'] internally.
    if (name === "q") {
      var namevalues = value.match(/\b\w+(%3A|:)\w+\b/g);
      if (namevalues) {
        for (var thisValue, parts, i = 0; thisValue = namevalues[i]; i++) {
          parts = thisValue.split(/%3A|:/);
          // If the name part is a keyword we know about, we set it in the API
          // and remove it from the eventual q string.
          // Otherwise, we just leave it as-is
          if (this.has(parts[0])) {
            this.setParam(parts[0], parts[1], silent);
            // TODO: if AppliedLabels view is brought back, we want this line
            // enabled again:
            // value = value.replace(thisValue, '');
          }
        }
      }
    }
    if (this.has(name)) {
      var currentValue = this.get(name);
      // 'stage=closed' is actually an alias for state=closed
      if (name === "stage" && (value === "closed" || currentValue === "closed")) {
        // Also, the default value for state is 'open'
        this.setParam("state", value === "all" ? "open" : value, silent);
        // We don't return here - stage=closed or =all must be set too to match the
        // state we want the filter UI to be in.. Yeah, hack.
      }
      if (currentValue instanceof Array) {
        // Likely a 'labels' array..
        // We don't want to consider status- labels as labels
        // in this API although they are at the backend.
        // We special-case label:status-* updates and set the
        // corresponding stage value instead.
        if (name === "labels" &&
           (value.indexOf("status-") === 0 || this.bugstatuses.indexOf(value) > -1)) {
          return this.setParam("stage", value.replace(/^status-/,""), silent);
        }
        if (value && currentValue.indexOf(value) === -1) {
          if (value instanceof Array) {
            // A brand new array of values - this resets the property completely
            // However, to make sure we go through the special status- processing above
            // we set one value at a time
            this.set(name, [], {silent:true});
            for (i = 0; i < value.length; i++) {
              this.setParam(name, value[i], silent);
            }
          } else { // We add the new value to the existing array
            this.set(name, currentValue.concat([value]), options);
          }
        } else {
          this.set(name, [], options);
        }
      } else {
        this.set(name, value, options);
      }
      return;
    } else {
      // if it's not a known property, stuff it into search
      // append name:value to existing search
      // TODO: we should never get here. Is it OK to stuff it into search,
      // or should we throw?
      this.set("q", this.get("q") + " " + name + ":" + value, options);
    }
    if (silent) {
      // The UI is normally updated after a successful request to the backend,
      // however if something is broken and the request doesn't suceed, certain
      // parts of the UI that are changed directly by the user will now be out of
      // sync with the model's state. In particular, if the search field was edited
      // and the request failed, the model still remembers the search query but it's
      // not in the UI.
      // It may be somewhat annoying and surprising that a search term you've changed
      // reverts to its previous state if the backend acts up - but the alternative is
      // worse: UI inconsistency, with a list that doesn't match the search UI state.
      issueList.events.trigger("search:update", this.get("q"));
    }
  },
  deleteLabel: function(labelStr) {
    var currentLabels = this.get("labels");
    if (currentLabels.indexOf(labelStr) > -1) {
      currentLabels.splice(currentLabels.indexOf(labelStr), 1);
      this.set("labels", {}, {silent:true}); // hack: to trigger change event on *next* set..
      // hack explained: currentLabels is a reference to an array, so updates cause immediate change.
      // However, when we're manipulating the array directly, the model does not fire any change events
      // because JS gives Backbone no way to observe changes to an array. If we set label to a reference
      // to the array it already references, it won't fire change events either, even if array content
      // was updated in the meantime. Hence the workaround sets it to {} and then back to the array.
      this.setParam("labels", currentLabels);
    }
  },
  fromQueryString: function(str, silent) {
    var self = this;
    var namevalues;
    if (str.substr(0,1) === "?") {
      str = str.substr(1);
    }
    namevalues = str.split(/&/g);
    namevalues.forEach(function(namevalue) {
      var pair;
      var theName;
      var theValue;
      pair = namevalue.split("=");
      theName = pair[0];
      theValue = pair[1];
      // just in case..
      if (theName === "label") {
        theName = "labels";
      }
      self.setParam(theName, theValue, silent);
    });
  },
  // silentReset is intended used when a request to the backend fails
  // it updates the model with data from the query string (which isn't
  // updated until a backend request was successful) without triggering
  // a new request to the backend.
  silentReset: function(str) {
    this.fromQueryString(str, true);
  }
});
