/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var issues = issues || {}; // eslint-disable-line no-use-before-define

issues.QrView = Backbone.View.extend({
  qrButton: null,
  events: {
    'click .wc-QrCode-launcher:not(.is-active)': 'showQr',
    'click .wc-QrCode-launcher.is-active': 'closeQr'
  },
  keyboardEvents: {
    'q': 'showQr'
  },
  render: function() {
    // Extract page URL from bug description
    var body = this.model.get('body');
    var regex = /[^]*?href\=\"(.*?)\"/ig;
    var urlMatch = regex.exec(body);

    this.qrButton = $('.wc-QrCode-launcher');
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
    this.qrButton[0].setAttribute('aria-pressed', 'true');
    this.$el.find('.wc-QrCode-launcher').after(this.qrImage.render().el);
  }
});

issues.QrImageView = Backbone.View.extend({
  className: 'wc-QrCode-image',
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
    this.issueView.qrButton[0].setAttribute('aria-pressed', 'false');
    // detach() (vs remove()) here because we don't want to lose events if the
    // user reopens the QR code.
    this.$el.children().detach();
  }
});
