/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function BugForm() {
  var urlField = $('#url');
  var descField = $('#description');
  var summaryField = $('#summary');
  var submitButtons = $('.Report-form button.Button');
  var inputMap = {
    'url': {
      'elm': urlField, // elm is a jQuery object
      'valid': false,
      'helpText': 'A URL is required.'
    },
    'summary' : {
      'elm': summaryField,
      'valid': false,
      'helpText': 'Please give a summary.'
    }
  };

  var self = {
    init: function() {
      self.checkParams();
      urlField.on('input', self.copyURL);
      self.disableSubmits();
      urlField.on('blur input', self.checkValidity);
      summaryField.on('blur input', self.checkValidity);
    },
    checkParams: function() {
        // Assumes a URI like: /?open=1&url=http://webpy.org/, for use by addons
        // Quick sanity check
        if (!location.search.search(/open=1&url=.+$/)) {
          return;
        }
        var urlParam = location.search.match(/url=(.+)[&$]/);
        if (urlParam != null) {
          urlField.val(decodeURIComponent(urlParam[1]));
          self.copyURL();
          self.makeValid('url');
      }
    },
    disableSubmits: function() {
      submitButtons.prop('disabled', true);
      submitButtons.addClass('is-disabled');
    },
    enableSubmits: function() {
      submitButtons.prop('disabled', false);
      submitButtons.removeClass('is-disabled');
    },
    /* Check to see that the form element is not empty.
       We don't do any other kind of validation yet. */
    checkValidity: function(e) {
      if ($.trim(e.target.value) === "") {
        self.makeInvalid(e.target.id);
      } else {
        self.makeValid(e.target.id);
      }
    },
    makeInvalid: function(id) {
      // Early return if inline help is already in place.
      if (inputMap[id].elm.parent().prev('.help-inline').length) {
        return;
      }

      inputMap[id].valid = false;
      inputMap[id].elm.parents('.u-formGroup')
                      .removeClass('no-error')
                      .addClass('has-error');

      $('<span></span>', {
        'class': 'help-inline wc-bold',
        'text': inputMap[id].helpText
      }).insertAfter('label[for='+id+']');
      self.disableSubmits();
    },
    makeValid: function(id) {
      inputMap[id].valid = true;
      inputMap[id].elm.parents('.u-formGroup')
                      .removeClass('has-error')
                      .addClass('no-error');
      inputMap[id].elm.prev('.help-inline').remove();

      if (inputMap['url'].valid && inputMap['summary'].valid) {
        self.enableSubmits();
      }
    },
    /*
       copy URL from urlField into the first line of the
       description field. early return if the user has deleted
       the first so we don't make them sad.
    */
    copyURL: function() {
      var firstLine = /^1\)\sNavigate.*\n/;
      descField.val(function(idx, value){
        var prefix = '1) Navigate to: ';
        if (!firstLine.test(value)) {
          return value;
        }
        return value.replace(firstLine, prefix + urlField.val() + '\n');
      });
    }
  };

  return self.init();
}

$(function(){
  new BugForm();
});
