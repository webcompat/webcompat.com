/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function(){
  var logLink = $('.nav__section--right .nav__link, .issue__login_link');
  logLink.click(function() {
    var href = logLink.prop('href');
    logLink.prop('href', href + '?next=' + location.href);
  });
}());
