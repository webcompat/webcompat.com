/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

 var issues = issues || {};

// Read-only Model of all labels in the repo
issues.AllLabels = Backbone.Model.extend({
  url: function() {
    return '/api/issues/labels';
  },
  parse: function(response) {
    this.set({labels: response});
  }
});

issues.LabelsView = Backbone.View.extend({
  el: $('.issue__label'),
  editorButton: null,
  events: {
    'click .issue__label--modify:not(.is-active)': 'editLabels',
    'click .issue__label--modify.is-active': 'closeEditor'
  },
  template: _.template($('#issue-labels-tmpl').html()),
  // this subTemplate will need to be kept in sync with
  // relavant parts in $('#issue-labels-tmpl')
  subTemplate: _.template([
    '<% _.each(labels, function(label) { %>',
      '<span class="issue__label_item issue__label_item--badge" style="background-color:#<%=label.color%>">',
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
    var self = this;
    var headersBag = {headers: {'Accept': 'application/json'}};
    this.editorButton = $('.issue__label--modify');
    this.allLabels = new issues.AllLabels();
    this.labelEditor = new issues.LabelEditorView({
      model: this.allLabels,
      issueView: this,
    });
    this.allLabels.fetch(headersBag).success(function(){
      self.issueLabels = _.pluck(self.model.get('labels'), 'name');
      self.repoLabels = _.pluck(self.labelEditor.model.get('labels'), 'name');
      self.editorButton.show();
    });
  },
  editLabels: function() {
    this.editorButton.addClass('is-active');
    this.$el.find('.issue__label--modify').after(this.labelEditor.render().el);
    var toBeChecked = _.intersection(this.issueLabels, this.repoLabels);
    _.each(toBeChecked, function(labelName) {
      $('[name=' + labelName + ']').prop("checked", true);
    });
  }
});

issues.LabelEditorView = Backbone.View.extend({
  className: 'label_editor',
  events: {
    'change input[type=checkbox]': 'updateView',
    'click button': 'closeEditor',
    'keyup .label_editor__search': 'filterLabels'
  },
  initialize: function(options) {
    this.issueView = options.issueView;
  },
  template: _.template($('#label-editor-tmpl').html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.resizeEditorHeight();
    return this;
  },
  reRender: function(data) {
    //only re-render the labels into the labels wrapper
    this.issueView.$el.find('.labels__wrapper').html(this.issueView.subTemplate(data));
    this.issueView.$el.find('.issue__label--modify').addClass('is-active');
  },
  resizeEditorHeight: function() {
    var removeQuotes = function(string) {
        if (typeof string === 'string' || string instanceof String) {
            string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
        }
        return string;
    }
    var getBreakpoint = function() {
        var style;
        if (window.getComputedStyle &&
              window.getComputedStyle(document.body, '::after')) {
            style = window.getComputedStyle(document.body, '::after');
            style = style.content;
        }
        return JSON.parse( removeQuotes(style) );
    }
    var breakpoint = getBreakpoint();
    if (breakpoint.resizeEditorHeight) {
      var el = document.querySelector('.label_list');
      var parent = el.parentNode;
      el.style.maxHeight = parent.offsetHeight + 'px';
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
      item.color = item.dataset.color;
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
    var re = new RegExp('^' + e.target.value, 'i');
    var matches = _.pluck(_.filter(this.model.get('labels'), function(label) {
      return re.test(label.name);
    }), 'name');

    // make sure everything is showing
    $('.label_item').show();

    // hide the non-filter matches
    var hidden = _.difference(_.pluck(this.model.get('labels'), 'name'), matches);
    _.each(hidden, function(name) {
      $('input[name='+name+']').closest('.label_item').hide();
    });
  }, 100)
});
