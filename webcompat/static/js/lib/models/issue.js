/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Contains some code modified from https://github.com/jfromaniello/li
 * which is released under the MIT license. */

var issues = issues || {}; // eslint-disable-line no-use-before-define
var issueList = issueList || {}; // eslint-disable-line no-use-before-define

if (!window.md) {
  window.md = window.markdownit({
    breaks: true,
    html: true,
    linkify: true
  }).use(window.markdownitSanitizer).use(window.markdownitEmoji);
}

issues.Issue = Backbone.Model.extend({
  _namespaceRegex: /(browser|closed|os|status)-/i,
  urlRoot: function() {
    return "/api/issues/" + this.get("number");
  },
  initialize: function() {
    this.on("change:state", _.bind(function() {
      this.set("issueState", this.getState(this.get("state"),
                                           this.get("labels")));
    }, this));
    this.on("change:labels", _.bind(function() {
      this.set("issueState", this.getState(this.get("state"),
                                           this.get("labels")));
    }, this));
  },
  getState: function(state, labels) {
    var labelsNames = _.pluck(labels, "name");
    if (state === "closed") {
      this.set("stateClass", "closed");
      return "Closed";
    }
    if (labelsNames.indexOf("sitewait") > -1) {
      this.set("stateClass", "sitewait");
      return "Site Contacted";
    }
    if (labelsNames.indexOf("contactready") > -1) {
      this.set("stateClass", "ready");
      return "Ready for Outreach";
    }
    if (labelsNames.indexOf("needsdiagnosis") > -1) {
      this.set("stateClass", "needsDiagnosis");
      return "Needs Diagnosis";
    }
    if (labelsNames.indexOf("needscontact") > -1) {
      this.set("stateClass", "needsContact");
      return "Needs Contact";
    }
    if (labelsNames.indexOf("fixed") > -1) {
      this.set("stateClass", "fixed");
      return "Fixed";
    }
    if (labelsNames.indexOf("worksforme") > -1) {
      this.set("stateClass", "worksforme");
      return "Appears to work";
    }
    //Needs Triage is the default value.
    this.set("stateClass", "needstriage");
    return "Needs Triage";
  },
  parse: function(response) {
    var labelList = new issues.LabelList({"labels":response.labels});
    var labels = labelList.get("labels");
    this.set({
      body: md.render(response.body),
      commentNumber: response.comments,
      createdAt: response.created_at.slice(0, 10),
      issueState: this.getState(response.state, labels),
      labels: labels,
      number: response.number,
      reporter: response.user.login,
      reporterAvatar: response.user.avatar_url,
      state: response.state,
      title: response.title
    });
  },
  toggleState: function(callback) {
    var newState = this.get("state") === "open" ? "closed" : "open";
    $.ajax({
      contentType: "application/json",
      data: JSON.stringify({"state": newState}),
      type: "PATCH",
      url: "/api/issues/" + this.get("number") + "/edit",
      success: _.bind(function() {
        this.set("state", newState);
        if (callback) {
          callback();
        }
      }, this),
      error: function() {
        var msg = "There was an error editing this issues's status.";
        wcEvents.trigger("flash:error", {message: msg, timeout: 4000});
      }
    });
  },
  updateLabels: function(labelsArray) {
    // Save ourselves some requests in case nothing has changed.
    if (!$.isArray(labelsArray) ||
        _.isEqual(labelsArray.sort(), _.pluck(this.get("labels"), "name").sort())) {
      return;
    }
    var labels = new issues.LabelList({"labels":labelsArray,
      url: "/api/issues/" + this.get("number") + "/labels"});
    labels.save(null, {
      success: _.bind(function(response) {
        // update model after success
        var updatedLabels = new issues.LabelList({"labels": response.get("labels")});
        this.set("labels", updatedLabels.get("labels"));
      }, this),
      error: function() {
        var msg = "There was an error setting labels.";
        wcEvents.trigger("flash:error", {message: msg, timeout: 4000});
      }
    });
  }
});

issueList.Issue = issues.Issue.extend({});

issueList.IssueCollection = Backbone.Collection.extend({
  model: issueList.Issue,
  /* the url property is set in issueList.IssueView#fetchAndRenderIssues */
  initialize: function(options) {
    // set defaults
    this.params = options && options.params || {page: 1, per_page: 50,
      state: "open", stage: "all", sort: "created", direction: "desc"};
    this.path = options && options.path || "/api/issues";
  },
  parse: function(response, jqXHR) {
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
  setURLState: function(path, params) {
    this.path = path;
    this.params = params;
  },
  parseHeader: function(linkHeader) {
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
    var keysRegExp = /(\b[0-9a-z\.-]+\b)/g;
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
  getNextPage: function() {
    if (this.linkHeader && this.linkHeader.hasOwnProperty("next")) {
      return this.linkHeader.next;
    } else {
      return null;
    }
  },
  getPrevPage: function() {
    if (this.linkHeader && this.linkHeader.hasOwnProperty("prev")) {
      return this.linkHeader.prev;
    } else {
      return null;
    }
  },
  normalizeAPIParams: function(paramsArg) {
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
      state:     "state",
      creator:   "author",
      mentioned: "mentions"
    };
    var sitesearchRegExp = /site:([\w-\.]+(:\d+)?)/g;

    if (_.isString(paramsArg)) {
      var paramsArray = _.uniq(paramsArg.split("&"));
      _.forEach(paramsArray, function(param) {
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
    _.forEach(qMap, function(val, key) {
      if (key in params) {
        params.q += " " + val + ":" + params[key];
        delete params[key];
      }
    });

    // Finally, scope this to our issues repo.
    params.q += " repo:" + repoPath.slice(0,-7);

    return params;
  }
});
