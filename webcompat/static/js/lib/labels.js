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
  }
});

// We need a complete list of labels for certain operations,
// especially namespace mapping. If the list we're handling
// doesn't happen to contain all the labels initially, it
// can't get prefixing/unprefixing right when labels in previously
// unseen namespaces are added in their local name form.
// Hence, we set up a single, globally accessible "all labels" model
// This is set up as early as possible to avoid timing issues
if(!issues.allLabels) {
  issues.allLabels = new issues.LabelList();
}

issues.LabelsView = Backbone.View.extend({
  _isLoggedIn: $('body').data('username'),
  el: $('.Label-wrapper'),
  editorButton: null,
  events: {
    'click .LabelEditor-launcher:not(.is-active)': 'editLabels',
    'click .LabelEditor-launcher.is-active': 'closeEditor'
  },
  keyboardEvents: {
    'e': 'editLabels'
  },
  template: _.template($('#issue-labels-tmpl').html()),
  // this subTemplate will need to be kept in sync with
  // relavant parts in $('#issue-labels-tmpl')
  subTemplate: _.template([
    '<% _.each(labels, function(label) { %>',
      '<span class="Label Label--badge" style="background-color:#<%=label.color%>">',
        '<%= label.name %>',
      '</span>',
    '<% }); %>'].join('')),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.fetchLabels();
    return this;
  },
  closeEditor: function() {
    this.labelEditor.closeEditor();
  },
  renderLabels: function() {
    this.$el.html(this.template(this.model.toJSON()));
  },
  fetchLabels: function() {
    this.editorButton = $('.LabelEditor-launcher');
    this.labelEditor = new issues.LabelEditorView({
      model: issues.allLabels,
      issueView: this,
    });
    if (this._isLoggedIn) {
      this.issueLabels = this.getIssueLabels();
      this.editorButton.show();
    }
  },
  getIssueLabels: function() {
    return _.pluck(this.model.get('labels'), 'name');
  },
  editLabels: function() {
    this.editorButton.addClass('is-active');
    this.$el.find('.LabelEditor-launcher').after(this.labelEditor.render().el);
    var toBeChecked = _.intersection(this.getIssueLabels(), issues.allLabels.toArray());
    _.each(toBeChecked, function(labelName) {
      $('[name="' + labelName + '"]').prop('checked', true);
    });
  }
});

issues.LabelEditorView = Backbone.View.extend({
  className: 'LabelEditor',
  events: {
    'change input[type=checkbox]': 'updateView',
    'click button': 'closeEditor',
    'keyup .LabelEditor-search': 'filterLabels'
  },
  keyboardEvents: {
    'esc': 'closeEditor'
  },
  initialize: function(options) {
    this.issueView = options.issueView;
  },
  template: _.template($('#label-editor-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model));
    this.resizeEditorHeight();
    _.defer(_.bind(function() {
      this.$el.find('.LabelEditor-search').focus();
    }, this));
    return this;
  },
  reRender: function(data) {
    //only re-render the labels into the labels wrapper
    this.issueView.$el.find('.Label-list').html(this.issueView.subTemplate(data));
    this.issueView.$el.find('.LabelEditor-launcher').addClass('is-active');
  },
  resizeEditorHeight: function() {
    var getBreakpoint = function() {
      var style;
      var doResize = false;
      if (window.getComputedStyle &&
            window.getComputedStyle(document.body, '::after')) {
            style = window.getComputedStyle(document.body, '::after').content;
      }
      if (style.match(/resizeEditor/)) {
        doResize = true;
      }
      return doResize;
    };

    if (getBreakpoint()) {
      _.defer(function(){
        var labelEditorheight = parseInt($('.LabelEditor').css( "height" ), 10),
            labelHeaderheight = parseInt($('.LabelEditor-row--header').css("height"), 10);
        $('.LabelEditor-list').height(labelEditorheight -labelHeaderheight );
        $("html, body").animate({ scrollTop: 0 }, 0);
      });
    }
  },
  updateView: function() {
    // we do the "real" save when you close the editor.
    // this just updates the UI responsively
    var checked = $('input[type=checkbox]:checked');
    // build up an array of objects that have
    // .name and .color props that the templates expect
    var modelUpdate = [];
    _.each(checked, function(item) {
      //item already has a .name property
      item.color = $(item).data('color');
      modelUpdate.push(item);
    });
    this.reRender({labels: modelUpdate});
  },
  closeEditor: function() {
    var checked = $('input[type=checkbox]:checked');
    var labelsArray = _.pluck(checked, 'name');
    this.issueView.editorButton.removeClass('is-active');
    this.issueView.model.updateLabels(labelsArray);
    // detach() (vs remove()) here because we don't want to lose events if the
    // user reopens the editor.
    this.$el.children().detach();
  },
  filterLabels: _.debounce(function(e) {
    var escape = function(s) {
      return s.replace(/[-\/\\^$*+?:.()|[\]{}]/g, '\\$&');
    };
    var re = new RegExp('^' + escape(e.target.value), 'i');
    var toHide = _.filter(this.model.toArray(), function(label) {
      return !re.test(label);
    });

    // make sure everything is showing
    $('.LabelEditor-item').show();

    // hide the non-filter matches
    _.each(toHide, function(name) {
      $('input[name=' + escape(name) + ']').closest('.LabelEditor-item').hide();

    });
  }, 100)
});
