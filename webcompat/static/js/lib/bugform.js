/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function BugForm() {
  var urlField = $('#url');
  var descField = $('#description');
  var problemType = $('[name=problem_category]');
  var submitButtons = $('.Report-form button.Button');
  var inputMap = {
    'url': {
      'elm': urlField, // elm is a jQuery object
      'valid': null,
      'helpText': 'A URL is required.'
    },
    'problem_type': {
      'elm': problemType,
      'valid': null,
      'helpText': 'Problem type required.'
    }
  };

  var self = {
    init: function() {
      self.checkParams();
      urlField.on('input', self.copyURL);
      self.disableSubmits();
      descField.on('focus', self.checkProblemTypeValidity);
      problemType.on('change', self.checkProblemTypeValidity);
      urlField.on('blur input', self.checkURLValidity);
    },
    checkParams: function() {
        // Assumes a URI like: /?open=1&url=http://webpy.org/, for use by addons
        // Quick sanity check
        if (!location.search.search(/open=1/) && !location.search.search(/url=/)) {
          return;
        }
        var urlParam = location.search.match(/url=(.+)/);
        if (urlParam != null) {
          // weird Gecko bug. See https://bugzilla.mozilla.org/show_bug.cgi?id=1098037
          urlParam = self.trimWysiwyg(urlParam[1]);
          urlField.val(decodeURIComponent(urlParam));
          self.copyURL();
          self.makeValid('url');
      }
    },
    trimWysiwyg: function(url) {
      //trim wysiwyg://N/ from URL.
      var wysiwygRe = /(wysiwyg:\/\/\d+\/)/i;
      if (url.search(wysiwygRe) !== 0) {
        return url;
      } else {
        return url.replace(wysiwygRe, '');
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
    checkProblemTypeValidity: function() {
      if (!$('[name=problem_category]:checked').length) {
        self.makeInvalid('problem_type');
      } else {
        self.makeValid('problem_type');
      }
    },
    /* Check to see that the URL input element is not empty.
       We don't do any other kind of validation yet. */
    checkURLValidity: function() {
      if ($.trim(urlField.val()) === "") {
        self.makeInvalid('url');
      } else {
        self.makeValid('url');
      }
    },
    makeInvalid: function(id) {
      // Early return if inline help is already in place.
      if (inputMap[id].valid === false) {
        return;
      }

      var inlineHelp = $('<span></span>', {
        'class': 'help-inline wc-bold',
        'text': inputMap[id].helpText
      });


      inputMap[id].valid = false;
      inputMap[id].elm.parents('.u-formGroup')
                      .removeClass('no-error')
                      .addClass('has-error');

      if (id === 'url') {
        inlineHelp.insertAfter('label[for='+id+']');
      }

      if (id === 'problem_type') {
        inlineHelp.appendTo('legend.u-formLabel');
      }

      self.disableSubmits();
    },
    makeValid: function(id) {
      inputMap[id].valid = true;
      inputMap[id].elm.parents('.u-formGroup')
                      .removeClass('has-error')
                      .addClass('no-error');

      inputMap[id].elm.parents('.u-formGroup').find('.help-inline').remove();

      if (inputMap['url'].valid && inputMap['problem_type'].valid) {
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
