/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 var issues = issues || {};

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
    this.set('namespaceRegex', /(browser|closed|os|status)-(.+)/i);
    this.set('defaultLabelURL', '/api/issues/labels');
    // The templating engine needs objects that have JS properties, it won't call
    // get('labels'). Setting a property here makes sure we can pass the model
    // directly to a template() method
    this.on('change:labels', function(){
      this.labels = this.get('labels');
    });
    // if we're initialized with {labels:array-of-objects}, process the data
    var inputLabelData = this.get('labels');
    this.set('labels', []);
    if(inputLabelData) {
      this.parse(inputLabelData);
    } else {
      // No input data, let's fetch it from a URL
      if(!this.get('url')) {
        // default to "all labels" URL
        this.set('url', this.get('defaultLabelURL'));
      }
      var headersBag = {headers: {'Accept': 'application/json'}};
      this.fetch(headersBag); // This will trigger parse() on response
    }
  },
  parse: function(labelsArray){
    var list = [];
    var namespaceMap = {};
    for(var i = 0, matches, theLabel; i < labelsArray.length; i++){
      // We assume we either have an object with .name or an array of strings
      theLabel = labelsArray[i].name || labelsArray[i];
      matches = theLabel.match(this.get('namespaceRegex'));
      if(matches) {
        namespaceMap[matches[2]] = matches[1];
        list[i] = {
          'name': matches[2],
          'url': labelsArray[i].url,
          'color': labelsArray[i].color,
          'remoteName': matches[0]
         };
      }else {
        if(typeof theLabel === 'object') {
          list[i] = labelsArray[i];
          list[i].remoteName = list[i].name;
        } else {
          list[i] = {'name': theLabel};
        }
      }
    }
    this.set('labels', list);
    this.set('namespaceMap', namespaceMap);
  },
  // toPrefixed takes a local label name and maps it
  // to the prefixed repository form. Also handles an array
  // of label names (Note: not arrays of objects)
  toPrefixed: function (input) {
    if (typeof input === 'string') {
      if(issues.allLabels.get('namespaceMap')[input]) {
        return issues.allLabels.get('namespaceMap')[input] + '-' + input;
      }
      return input;
    } else {
      // This is not a string, we assume it's an array
      return input.map(function(label){
        return issues.allLabels.toPrefixed(label);
      });
    }
  },
  url: function() {
    return this.get('url');
  },
  // Returns a simple array of unprefixed labels - strings only
  toArray: function(){
    return _.pluck(this.get('labels'), 'name');
  },
  // To save the model to the server, we need to make
  // sure we apply the prefixes the server expects.
  // The JSON serialization will take care of it.
  toJSON: function(){
    var labelsArray = _.pluck(this.get('labels'), 'name');
    return issues.allLabels.toPrefixed(labelsArray);
  },
  has: function(label) {
    if(typeof label === 'string') {
      return this.toArray().indexOf(label) > -1;
    } else { // we assume this is an object
      return this.toArray().indexOf(label.name) > -1;
    }
  },
  merge: function(inputArray){
    if(!(inputArray instanceof issues.LabelList)) {
      inputArray = new issues.LabelList({labels:inputArray});
    }
    var existingLabels = this.get('labels');
    var newLabels = inputArray.get('labels');
    for (var i = 0; i < newLabels.length; i++) {
      if(!this.has(newLabels[i])) {
        existingLabels.push(newLabels[i]);
      }
    };
    var existingMap = this.get('namespaceMap');
    var newMap = inputArray.get('namespaceMap');
    for(var property in newMap) {
      // we assume that the "old" map may have better data than the "new"
      existingMap[property] = existingMap[property] || newMap[property];
    }
    this.set('labels', existingLabels);
    this.set('namespaceMap', existingMap);
  }
});
