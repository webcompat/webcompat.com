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

function removeQuotes(string) {
    if (typeof string === 'string' || string instanceof String) {
        string = string.replace(/^['"]+|\s+|\\|(;\s?})+|['"]$/g, '');
    }
    return string;
}
function getBreakpoint() {
    var style;
    if ( window.getComputedStyle && window.getComputedStyle(document.body, '::after') ) {
        style = window.getComputedStyle(document.body, '::after');
        style = style.content;
    }
    return JSON.parse( removeQuotes(style) );
}
