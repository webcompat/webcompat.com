/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 var issues = issues || {};

// Read-only Model of all labels in the repo
issues.AllLabels = Backbone.Model.extend({
  url: function() {
    return '/api/issues/labels';
  },
  // See also issues.Issue#removeNamespaces
  removeNamespaces: function(labelsArray) {
    // Return a copy of labelsArray with the namespaces removed.
    var namespaceRegex = /(browser|closed|os|status)-/i;
    var labelsCopy = _.cloneDeep(labelsArray);
    return _.map(labelsCopy, function(labelObject) {
      labelObject.name = labelObject.name.replace(namespaceRegex, '');
      return labelObject;
    });
  },
  parse: function(response) {
    this.set({
      // Store a copy of the original response, so we can reconstruct
      // the labels before talking back to the API.
      namespacedLabels: response,
      labels: this.removeNamespaces(response)
    });
  }
});

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
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.editorButton = $('.LabelEditor-launcher');
    this.allLabels = new issues.AllLabels();
    this.labelEditor = new issues.LabelEditorView({
      model: this.allLabels,
      issueView: this,
    });
    // Stash the allLabels model so we can get it from Issue model later
    this.model.set('repoLabels', this.allLabels);
    if (this._isLoggedIn) {
      this.allLabels.fetch(headersBag).success(_.bind(function(){
        this.issueLabels = this.getIssueLabels();
        this.repoLabels = _.pluck(this.labelEditor.model.get('labels'), 'name');
        this.editorButton.show();
      }, this));
    }
  },
  getIssueLabels: function() {
    return _.pluck(this.model.get('labels'), 'name');
  },
  editLabels: function() {
    this.editorButton.addClass('is-active');
    this.$el.find('.LabelEditor-launcher').after(this.labelEditor.render().el);
    var toBeChecked = _.intersection(this.getIssueLabels(), this.repoLabels);
    _.each(toBeChecked, function(labelName) {
      $('[name=' + labelName + ']').prop('checked', true);
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
    this.$el.html(this.template(this.model.toJSON()));
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
    var matches = _.pluck(_.filter(this.model.get('labels'), function(label) {
      return re.test(label.name);
    }), 'name');

    // make sure everything is showing
    $('.LabelEditor-item').show();

    // hide the non-filter matches
    var hidden = _.difference(_.pluck(this.model.get('labels'), 'name'), matches);
    _.each(hidden, function(name) {
      $('input[name=' + escape(name) + ']').closest('.LabelEditor-item').hide();
    });
  }, 100)
});
