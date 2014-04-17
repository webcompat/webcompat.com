/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function HomePage() {
  var button = $('#report-bug');
  var formContainer = $('#new-report');

  var self = {
    init: function() {
      button.on('click', self.toggleForm);
    },
    toggleForm: function(e) {
      var button = $(this);
      e.preventDefault();
      formContainer.slideToggle(function(){
        formContainer.toggleClass('form-closed')
                     .toggleClass('form-opened');
        button.toggleClass('closed')
              .toggleClass('opened');
      });
    }
  };

  return self.init();
}

$(function(){
  new HomePage();
});