/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {};

issues.QrView = Backbone.View.extend({
  qrButton: null,
  events: {
    'click .QrImage-launcher:not(.is-active)': 'showQr',
    'click .QrImage-launcher.is-active': 'closeQr'
  },
  keyboardEvents: {
    'q': 'showQr'
  },
  render: function() {
    // Extract page URL from bug description
    var body = this.model.attributes.body;
    var regex = /[^]*?href\=\"(.*?)\"/ig;
    var urlMatch = regex.exec(body);
    
    this.qrButton = $('.QrImage-launcher');
    if (!!urlMatch && urlMatch.length > 1) {
      this.qrImage = new issues.QrImageView({
        issueView: this,
        url: urlMatch[1]
      });
      this.qrButton.show();
    } else {
      this.qrButton.hide();
    }
    return this;
  },
  closeQr: function() {
    this.qrImage.closeQr();
  },
  showQr: function() {
    this.qrButton.addClass('is-active');
    this.$el.find('.QrImage-launcher').after(this.qrImage.render().el);
  }
});

issues.QrImageView = Backbone.View.extend({
  className: 'QrImage',
  events: {
    'click button': 'closeQr'
  },
  keyboardEvents: {
    'esc': 'closeQr'
  },
  initialize: function(options) {
    this.issueView = options.issueView;
    this.url = options.url;
  },
  template: _.template($('#qr-image-tmpl').html()),
  render: function() {
    var qrDataUrl = qr.toDataURL({value: this.url, size: 8});
    this.$el.html(this.template({'qrDataUrl': qrDataUrl}));
    return this;
  },
  closeQr: function() {
    this.issueView.qrButton.removeClass('is-active');
    // detach() (vs remove()) here because we don't want to lose events if the
    // user reopens the editor.
    this.$el.children().detach();
  }
});
