/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function BugForm() {
  this.form = $('#js-ReportForm form');
  this.urlField = $('#url');
  this.descField = $('#description');
  this.uploadField = $('#image');
  this.problemType = $('[name=problem_category]');
  this.submitButtons = $('#js-ReportForm .js-Button');
  this.loadingIndicator = $('.js-Loader');
  this.reportButton = $('#js-ReportBug');
  this.loaderImage = $('.js-Loader');
  this.screenshotData = '';

  this.inputMap = {
    'url': {
      'elm': this.urlField, // elm is a jQuery object
      'valid': null,
      'helpText': 'A URL is required.'
    },
    'problem_type': {
      'elm': this.problemType,
      'valid': null,
      'helpText': 'Problem type required.'
    },
    'image': {
      'elm': this.uploadField,
      // image should be valid by default because it's optional
      'valid': true,
      'helpText': 'Please select an image of the following type: jpg, png, gif, or bmp.'
    }
  };

  this.init = function() {
    this.checkParams();
    this.disableSubmits();
    this.urlField.on('input',      _.bind(this.copyURL, this));
    this.urlField.on('blur input', _.bind(this.checkURLValidity, this));
    this.descField.on('focus',     _.bind(this.checkProblemTypeValidity, this));
    this.problemType.on('change',  _.bind(this.checkProblemTypeValidity, this));
    this.uploadField.on('change',  _.bind(this.checkImageTypeValidity, this));
    this.submitButtons.on('click', _.bind(function() {
      this.loadingIndicator.show();
    }, this));

    // See if the user already has a valid form
    // (after a page refresh, back button, etc.)
    this.checkForm();

    // Set up listener for message events from screenshot-enabled add-ons
    window.addEventListener('message', _.bind(function(event) {
      // Make sure the data is coming from ~*inside the house*~!
      // (i.e., our add-on sent it)
      if (location.origin === event.origin) {
        this.form.on('submit', _.bind(this.submitFormWithScreenshot, this));

        this.screenshotData = event.data;
        this.addPreviewBackground(this.screenshotData);
      }
    }, this), false);
  };

  // If we've gotten this far, form validation has happened and
  // we're reacting to a submit event.
  this.submitFormWithScreenshot = function(event) {
    // Stop regular form submission
    event.preventDefault();
    // construct a FormData object and append the base64 image to it.
    var formdata = new FormData(this.form.get(0));
    // we call this 'screenshot', rather than 'image' because it needs to be
    // handled differently on the backend.
    formdata.append('screenshot', this.screenshotData);

    // so, we can do an ajax submission and have it respond the number.
    // we can inspect the xhr header
    this.loaderImage.show();
    $.ajax({
      contentType: false,
      processData: false,
      data: formdata,
      method: 'POST',
      url: '/issues/new',
      success: _.bind(function(response) {
        // navigate to thanks page.
        this.loaderImage.hide();
        window.location.href = '/thanks/' + response.number;
      }, this),
      error: function() {
        var msg = 'There was an error trying to file the bug, try again?.';
        wcEvents.trigger('flash:error', {message: msg, timeout: 3000});
      }
    });
  };

  this.checkParams = function() {
    // Assumes a URI like: /?open=1&url=http://webpy.org/, for use by addons
    // Quick sanity check
    if (!location.search.search(/open=1/) && !location.search.search(/url=/)) {
      return;
    }
    var urlParam = location.search.match(/url=(.+)/);
    if (urlParam != null) {
      // weird Gecko bug. See https://bugzilla.mozilla.org/show_bug.cgi?id=1098037
      urlParam = this.trimWyciwyg(urlParam[1]);
      this.urlField.val(decodeURIComponent(urlParam));
      this.copyURL();
      this.makeValid('url');
    }
  };

  this.trimWyciwyg = function(url) {
    //trim wyciwyg://N/ from URL.
    var wyciwygRe = /(wyciwyg:\/\/\d+\/)/i;
    if (url.search(wyciwygRe) !== 0) {
      return url;
    } else {
      return url.replace(wyciwygRe, '');
    }
  };

  this.disableSubmits = function() {
    this.submitButtons.prop('disabled', true);
    this.submitButtons.addClass('is-disabled');
  };

  this.enableSubmits = function() {
    this.submitButtons.prop('disabled', false);
    this.submitButtons.removeClass('is-disabled');
  };

  this.checkProblemTypeValidity = function() {
    if (!$('[name=problem_category]:checked').length) {
      this.makeInvalid('problem_type');
    } else {
      this.makeValid('problem_type');
    }
  };

  this.checkImageTypeValidity = function(event) {
    var splitImg = this.uploadField.val().split('.');
    var ext = splitImg[splitImg.length - 1].toLowerCase();
    var allowed = ['jpg', 'jpeg', 'jpe', 'png', 'gif', 'bmp'];
    // Bail if there's no image.
    if (!this.uploadField.val()) {
      return;
    }

    if (!_.includes(allowed, ext)) {
      this.makeInvalid('image');
    } else {
      this.makeValid('image');
      if (event) {
        this.showUploadPreview(event);
      }
    }
  };

  /* Check to see that the URL input element is not empty.
     We don't do any other kind of validation yet. */
  this.checkURLValidity = function() {
    if ($.trim(this.urlField.val()) === '') {
      this.makeInvalid('url');
    } else {
      this.makeValid('url');
    }
  };

  this.checkForm = function() {
    // Run through and see if there's any user input in the
    // required inputs
    var inputs = [this.problemType.filter(':checked').length,
                  this.urlField.val(),
                  this.uploadField.val()];
    if (_.some(inputs, Boolean)) {
      // then, check validity
      this.checkURLValidity();
      this.checkProblemTypeValidity();
      this.checkImageTypeValidity();
      // and open the form, if it's not already open
      if (!this.reportButton.hasClass('is-open')) {
        this.reportButton.click();
      }
    }
  };

  this.makeInvalid = function(id) {
    // Early return if inline help is already in place.
    if (this.inputMap[id].valid === false) {
      return;
    }

    var inlineHelp = $('<span></span>', {
      'class': 'wc-Form-helpMessage',
      'text': this.inputMap[id].helpText
    });

    this.inputMap[id].valid = false;
    this.inputMap[id].elm.parents('.js-Form-group')
                     .removeClass('is-validated js-no-error')
                     .addClass('is-error js-form-error');

    if (id === 'url') {
      inlineHelp.insertAfter('label[for=' + id + ']');
    }

    if (id === 'problem_type') {
      inlineHelp.appendTo('.wc-Form-information');
    }

    if (id === 'image') {
      inlineHelp.insertAfter('.wc-Form-label--upload');
    }

    this.disableSubmits();
  };

  this.makeValid = function(id) {
    this.inputMap[id].valid = true;
    this.inputMap[id].elm.parents('.js-Form-group')
                     .removeClass('is-error js-form-error')
                     .addClass('is-validated js-no-error');

    this.inputMap[id].elm.parents('.js-Form-group').find('.wc-Form-helpMessage').remove();

    if (this.inputMap['url'].valid &&
        this.inputMap['problem_type'].valid &&
        this.inputMap['image'].valid) {
      this.enableSubmits();
    }
  };
  /*
    If the users browser understands the FileReader API, show a preview
    of the image they're about to load.
  */
  this.showUploadPreview = function(event) {
    if (!(window.FileReader && window.File)) {
      return;
    }
    // We can just grab the 0th one, because we only allow uploading
    // a single image at a time (for now)
    var img = event.target.files[0];
    // One last validation check.
    if (!img.type.match('image.*')) {
      this.makeInvalid('image');
      return;
    }

    var reader = new FileReader();
    reader.onload = _.bind(function(event) {
      this.addPreviewBackground(event.target.result);
    }, this);
    reader.readAsDataURL(img);
  };

  this.addPreviewBackground = function(dataURI) {
    if (!_.startsWith(dataURI, 'data:image/png;base64')) {
      return;
    }

    var label = $('.js-image-upload').find('label').eq(0);
    label.css({
      'background': 'url(' + dataURI + ') no-repeat center / contain',
      'background-color': '#eee'
    });

    this.showRemoveUpload(label);
  };
  /*
    Allow users to remove an image from the form upload.
  */
  this.showRemoveUpload = function(label) {
    var removeBanner = $('.wc-UploadForm-button');
    var uploadWrapper = $('.wc-UploadForm-wrapper');

    removeBanner.removeClass('is-hidden');
    uploadWrapper.addClass('is-hidden');
    removeBanner.on('click', _.bind(function() {
      // clear out the input value, remove the preview and hide the banner
      this.uploadField.val(this.uploadField.get().defaultValue);
      label.css('background', 'none');
      removeBanner.addClass('is-hidden');
      uploadWrapper.removeClass('is-hidden');
      removeBanner.off('click');
    }, this));
  };
  /*
     copy URL from urlField into the first line of the
     description field. early return if the user has deleted
     the first so we don't make them sad.
  */
  this.copyURL = function() {
    var firstLine = /^1\)\sNavigate.*\n/;
    this.descField.val(_.bind(function(idx, value) {
      var prefix = '1) Navigate to: ';
      if (!firstLine.test(value)) {
        return value;
      }
      return value.replace(firstLine, prefix + this.urlField.val() + '\n');
    }, this));

  };

  return this.init();
}

$(function() {
  new BugForm();
});
