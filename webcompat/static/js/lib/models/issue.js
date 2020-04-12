/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Contains some code modified from https://github.com/jfromaniello/li
 * which is released under the MIT license. */

var issues = issues || {}; // eslint-disable-line no-use-before-define
var issueList = issueList || {}; // eslint-disable-line no-use-before-define

issues.Issue = Backbone.Model.extend({
  _namespaceRegex: /(browser|closed|os|status)-/i,
  _statuses: $("main").data("statuses"),
  urlRoot: function () {
    return "/api/issues/" + this.get("number");
  },
  getState: function (state, milestone) {
    if (state === "closed") {
      this.set("stateClass", "closed");
      return "Closed: " + milestone[0].toUpperCase() + milestone.slice(1);
    }
    if (milestone === "sitewait") {
      this.set("stateClass", "sitewait");
      return "Site Contacted";
    }
    if (milestone === "contactready") {
      this.set("stateClass", "contactready");
      return "Ready for Outreach";
    }
    if (milestone === "needsdiagnosis") {
      this.set("stateClass", "needsdiagnosis");
      return "Needs Diagnosis";
    }
    if (milestone === "needscontact") {
      this.set("stateClass", "needscontact");
      return "Needs Contact";
    }

    //Needs Triage is the default value.
    this.set("stateClass", "needstriage");
    return "Needs Triage";
  },
  parse: function (response) {
    var isLoggedIn = $("body").data("username");
    var milestone;
    var milestoneClass;
    if (response.milestone) {
      milestone = response.milestone.title;
    } else {
      if (isLoggedIn) {
        milestone = "Fix me: assign a status";
        milestoneClass = "fix-me-assign-a-status";
      } else {
        milestone = "No status assigned yet";
        milestoneClass = "no-status-assigned-yet";
      }
    }
    var labelList = new issues.LabelList({ labels: response.labels });
    var labels = labelList.get("labels");
    this.set({
      body: response.body_html,
      commentNumber: response.comments,
      createdAt: response.created_at.slice(0, 10),
      issueState: this.getState(response.state, milestone),
      labels: labels,
      locked: response.locked,
      milestone: milestone,
      milestoneClass: milestoneClass,
      number: response.number,
      reporter: response.user.login,
      reporterAvatar: response.user.avatar_url,
      state: response.state,
      title: this.getTitle(
        this.getDomain(response.title),
        this.getDescription(response.body_html),
        response.title
      ),
    });

    this.on(
      "change:milestone",
      _.bind(function () {
        var milestone = this.get("milestone");
        this.set(
          "issueState",
          this.getState(this._statuses[milestone].state, milestone)
        );
      }, this)
    );
  },

  getDescription: function (body) {
    // Get the Description of the body
    var div = document.createElement("div");
    div.innerHTML = body;
    var regex = /Description:(.+)\n/;
    var description = regex.exec(div.textContent);
    return description != null ? description[1].slice(0, 74) : null;
  },

  getDomain: function (title) {
    // Get the domain name from the title
    var regex = /^([^ ]+)/;
    var domain = regex.exec(title);
    return domain != null ? domain[1] : null;
  },

  getTitle: function (domain, description, title) {
    // Return a title for the issue aside
    var issue_title = title != null ? title : "";
    if (description) {
      issue_title = domain + " - " + description;
    }
    return issue_title;
  },

  updateLabels: function (labelsArray) {
    // Save ourselves some requests in case nothing has changed.
    if (
      !$.isArray(labelsArray) ||
      _.isEqual(labelsArray.sort(), _.map(this.get("labels"), "name").sort())
    ) {
      return;
    }
    var labels = new issues.LabelList({
      labels: labelsArray,
      url: "/api/issues/" + this.get("number") + "/labels",
    });
    labels.save(null, {
      success: _.bind(function (response) {
        // update model after success
        var updatedLabels = new issues.LabelList({
          labels: response.get("labels"),
        });
        this.set("labels", updatedLabels.get("labels"));
      }, this),
      error: function () {
        var msg = "There was an error setting labels.";
        wcEvents.trigger("flash:error", { message: msg, timeout: 4000 });
      },
    });
  },
});

issueList.Issue = issues.Issue.extend({});

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  /* the url property is set in issueList.IssueView#fetchAndRenderIssues */
  initialize: function (options) {
    // set defaults
    this.params = (options && options.params) || {
      page: 1,
      per_page: 50,
      state: "open",
      stage: "all",
      sort: "created",
      direction: "desc",
    };
    this.path = (options && options.path) || "/api/issues";
  },
  parse: function (response, jqXHR) {
    if (jqXHR.xhr.getResponseHeader("Link") != null) {
      //external code can access the parsed header via this.linkHeader
      this.linkHeader = this.parseHeader(jqXHR.xhr.getResponseHeader("Link"));
    } else {
      this.linkHeader = null;
    }
    if (response.hasOwnProperty("items")) {
      // Search API results return an Object with the
      // issues array in the items key
      return response.items;
    } else {
      return response;
    }
  },
  setURLState: function (path, params) {
    this.path = path;
    this.params = params;
  },
  parseHeader: function (linkHeader) {
    /* Returns an object like so:
      {
        next:  "/api/issues?per_page=50&state=open&page=3",
        last:  "/api/issues?per_page=50&state=open&page=4",
        first: "/api/issues?per_page=50&state=open&page=1",
        prev:  "/api/issues?per_page=50&state=open&page=1"
      } */
    var result = {};
    var entries = linkHeader.split(",");
    var relsRegExp = /\brel="?([^"]+)"?\s*;?/;
    var keysRegExp = /(\b[0-9a-z.-]+\b)/g;
    var sourceRegExp = /^<(.*)>/;

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i].trim();
      var rels = relsRegExp.exec(entry);
      if (rels) {
        var keys = rels[1].match(keysRegExp);
        var source = sourceRegExp.exec(entry)[1];
        var k;
        var kLength = keys.length;
        for (k = 0; k < kLength; k += 1) {
          result[keys[k]] = source;
        }
      }
    }

    return result;
  },
  getNextPage: function () {
    if (this.linkHeader && this.linkHeader.hasOwnProperty("next")) {
      return this.linkHeader.next;
    } else {
      return null;
    }
  },
  getPrevPage: function () {
    if (this.linkHeader && this.linkHeader.hasOwnProperty("prev")) {
      return this.linkHeader.prev;
    } else {
      return null;
    }
  },
  normalizeAPIParams: function (paramsArg) {
    /* ported version of normalize_api_params from helpers.py
    Normalize GitHub Issues API params to Search API conventions:

    Issues API params        | Search API converted values
    -------------------------|---------------------------------------
    state                    | into q as "state:open", "state:closed"
    creator                  | into q as "author:username"
    mentioned                | into q as "mentions:username"
    direction                | order
    */
    var params = {};
    var qMap = {
      state: "state",
      creator: "author",
      mentioned: "mentions",
    };
    var sitesearchRegExp = /site:([\w-.]+(:\d+)?)/g;
    var repoPath = $("main").data("repoPath");

    if (_.isString(paramsArg)) {
      var paramsArray = _.uniq(paramsArg.split("&"));
      _.forEach(paramsArray, function (param) {
        var kvArray = param.split("=");
        var key = kvArray[0];
        var value = kvArray[1];
        params[key] = value;
      });
    } else {
      params = paramsArg;
    }

    if ("direction" in params) {
      params.order = params.direction;
      delete params.direction;
    }

    // Support domain name search
    // Replace all site:DOMAIN_NAME to DOMAIN_NAME in:title
    if (params.q.match(sitesearchRegExp)) {
      params.q = params.q.replace(sitesearchRegExp, "$1 in:title");
    }

    // The rest need to be added to the "q" param as substrings
    _.forEach(qMap, function (val, key) {
      if (key in params) {
        params.q += " " + val + ":" + params[key];
        delete params[key];
      }
    });

    // Finally, scope this to our issues repo.
    params.q += " repo:" + repoPath.slice(0, -7);

    return params;
  },
});
