/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function HomePage() {
  var reportButton = $('#report-bug');
  var reportLink = $('#report-bug-link')
  var formContainer = $('#new-report');

  var self = {
    init: function() {
      reportButton.add(reportLink).on('click', self.toggleForm);
    },
    toggleForm: function(e) {
      e.preventDefault();
      $('html, body').animate({
        scrollTop: reportButton.offset().top + 5
      }, 250);

      if (reportButton.hasClass('opened')) {
        $('html, body').animate({
          scrollTop: 0
        }, 250);
      }
      formContainer.slideToggle(function(){
        formContainer.toggleClass('form-closed')
                     .toggleClass('form-opened');
        reportButton.toggleClass('closed')
                    .toggleClass('opened');
      });
    }
  };

  return self.init();
}

$(function(){
  new HomePage();
});