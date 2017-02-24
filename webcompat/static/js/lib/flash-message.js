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

var FlashMessageView = Backbone.View.extend({
  tagName: "div",
  className: "wc-FlashMessage js-flashmessage",
  initialize: function() {
    wcEvents.on("flash:error", _.bind(this.showError, this));
    wcEvents.on("flash:info", _.bind(this.show, this));
    wcEvents.on("flash:notimeout", _.bind(this.showForever, this));
    wcEvents.on("flash:thanks", _.bind(this.showThanks, this));
  },
  render: function(message) {
    this.$el.html(message)
            .addClass("is-active")
            .appendTo("body").show();

    return this;
  },
  show: function(opts) {
    var timeout = opts.timeout || 4000;
    var message = opts.message;

    this.render(message);
    setTimeout(_.bind(this.hide, this), timeout);
  },
  showError: function(data) {
    this.$el.addClass("is-error");
    this.show(data);
  },
  showForever: function(opts) {
    var message = opts.message;
    this.render(message);
  },
  showThanks: function(opts) {
    var buildTemplate = _.template([
      "<h4>Thanks for reporting an issue!</h4>",
      "<p>You're helping us make the web a better place to work and play.</p>",
      "<p>Tell your friends about the bug you just filed:</p>",
      "<a class=\"wc-Button wc-Button--action\" href=\"https://twitter.com/intent/tweet?text=<%- encodeURIComponent(\"I just filed a bug on the internet:\") %>&url=<%- encodeURIComponent(\"https://webcompat.com/issues/\") %><%= number %>&via=webcompat\" target=\"_blank\">Share on Twitter</a>",
      "<a class=\"wc-Button wc-Button--action\" href=\"https://facebook.com/sharer/sharer.php?u=<%- encodeURIComponent(\"https://webcompat.com/issues/\") %><%= number %>\" target=\"_blank\">Share on Facebook</a>"
    ].join(""));

    this.$el.addClass("is-active wc-FlashMessage--thanks");
    this.$el.html(buildTemplate({number: opts.message}))
            .insertBefore(".wc-Issue-information").show();
  },
  hide: function() {
    this.$el.fadeOut();
  }
});

new FlashMessageView();
