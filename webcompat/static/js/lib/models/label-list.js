/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

/**
* A LabelList is a list of labels.
*
* It takes care of all namespace prefixing and unprefixing, so that
* the rest of the app doesn't ever need to worry about those details.
* To initialize, either pass in a list of labels as an array of strings
* or an array of objects:
*
* new issues.LabelList({labels: ['firefox', 'ie', 'chrome']});
*
* new issues.LabelList({labels: [{name:'status-worksforme', url:'...',
*    color:'cccccc'}]});
*
* Or a URL to a JSON file describing the labels:
*
* new issues.LabelList({url:'/path/to/labels.json'});
*/

issues.LabelList = Backbone.Model.extend({
  initialize: function() {
    this.set("namespaceRegex", /(browser|closed|os|status)-(.+)/i);
    // Temporarily set pagination to 100 labels per page, until
    // we fix Issue #781
    this.set("defaultLabelURL", "/api/issues/labels?per_page=100");
    // The templating engine needs objects that have JS properties, it won't call
    // get('labels'). Setting a property here makes sure we can pass the model
    // directly to a template() method
    this.on("change:labels", function() {
      this.labels = this.get("labels");
    });
    // if we're initialized with {labels:array-of-objects}, process the data
    var inputLabelData = this.get("labels");
    this.set("labels", []);
    if (inputLabelData) {
      this.parse(inputLabelData);
    } else {
      // No input data, let's fetch it from a URL
      if (!this.get("url")) {
        // default to "all labels" URL
        this.set("url", this.get("defaultLabelURL"));
      }
      var headersBag = {headers: {"Accept": "application/json"}};
      this.fetch(headersBag); // This will trigger parse() on response
    }
  },
  parse: function(labelsArray) {
    var list = [];
    var namespaceMap = {};
    for (var i = 0, matches, theLabel; i < labelsArray.length; i++) {
      // We assume we either have an object with .name or an array of strings
      theLabel = labelsArray[i].name || labelsArray[i];
      matches = theLabel.match(this.get("namespaceRegex"));
      if (matches) {
        namespaceMap[matches[2]] = matches[1];
        list[i] = {
          "name": matches[2],
          "url": labelsArray[i].url,
          "color": labelsArray[i].color,
          "remoteName": matches[0]
        };
      } else {
        if (typeof labelsArray[i] === "object") {
          list[i] = labelsArray[i];
          list[i].remoteName = list[i].name;
        } else {
          list[i] = {"name": theLabel};
        }
      }
    }
    this.set("labels", list);
    this.set("namespaceMap", namespaceMap);
  },
  // toPrefixed takes a local label name and maps it
  // to the prefixed repository form. Also handles an array
  // of label names (Note: not arrays of objects)
  toPrefixed: function(input) {
    if (typeof input === "string") {
      if (issues.allLabels.get("namespaceMap")[input]) {
        return issues.allLabels.get("namespaceMap")[input] + "-" + input;
      }
      return input;
    } else {
      // This is not a string, we assume it's an array
      return input.map(function(label) {
        return issues.allLabels.toPrefixed(label);
      });
    }
  },
  url: function() {
    return this.get("url");
  },
  // Returns a simple array of unprefixed labels - strings only
  toArray: function() {
    return _.pluck(this.get("labels"), "name");
  },
  // To save the model to the server, we need to make
  // sure we apply the prefixes the server expects.
  // The JSON serialization will take care of it.
  toJSON: function() {
    var labelsArray = _.pluck(this.get("labels"), "name");
    return issues.allLabels.toPrefixed(labelsArray);
  }
});
