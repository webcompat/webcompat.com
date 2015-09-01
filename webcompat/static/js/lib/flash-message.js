/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
Flash messages can be triggered form anywhere in the application like so:

eventBus.trigger('flash:info', {message: 'hi', timeout: 1000});
eventBus.trigger('flash:error', {message: 'hi', timeout: 1000});

`opts.message` is the text to display.
`opts.timeout` (optional) is the length of time before fading the message out.
                          Default is 3 seconds
*/
var wcEvents = _.extend({},Backbone.Events);

var flashMessageView = Backbone.View.extend({
  tagName: 'div',
  className: 'wc-FlashMessage js-flashmessage',
  initialize: function() {
    wcEvents.on('flash:info', _.bind(this.show, this));
    wcEvents.on('flash:notimeout', _.bind(this.showForever, this));
    wcEvents.on('flash:error', _.bind(this.showError, this));
  },
  render: function(message) {
    this.$el.html(message)
            .addClass('is-active')
            .appendTo('body').show();

    return this;
  },
  show: function(opts) {
    var timeout = opts.timeout || 3000;
    var message = opts.message;

    this.render(message);
    setTimeout(_.bind(this.hide, this), timeout);
  },
  showForever: function(opts) {
    var message = opts.message;
    this.render(message);
  },
  showError: function(data) {
    this.$el.addClass('wc-FlashMessage--error');
    this.show(data);
  },
  hide: function() {
    this.$el.fadeOut();
  }
});

new flashMessageView();
