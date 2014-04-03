/*! webcompat.com
 *  Copyright (c) 2014 The fine folks who contribute to webcompat.com
 *
 *  This code is licensed under the MPL 2.0 License, except where
 *  otherwise stated. See http://mozilla.org/MPL/2.0/. */
function BugForm() {
  var urlField = $('#url');
  var descField = $('#description');

  var self = {
    init: function() {
      urlField.bind('input', self.copyURL);
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