/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function NavBar() {
  this.init = function() {
    this.setUpEvents();
  };

  this.setUpEvents = function() {
    this.navbarHandler();
  };

  this.navbarHandler = function() {
    var $navbar = $(".js-navigation");
    var $newIssueStepper = $("#wizard-container");
    var navbarHeight = $navbar.outerHeight();
    var lastScrollY = window.pageYOffset;
    var scrollTimeout = null;
    var isScrolling = false;
    $(window).on("scroll", function() {
      isScrolling = true;
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(function() {
        isScrolling = false;
      }, 500);
    });
    window.setInterval(function() {
      if (!isScrolling) {
        return;
      }
      if (window.pageYOffset < navbarHeight) {
        $navbar.removeClass("is-offscreen");
        $newIssueStepper.length > 0 &&
          $newIssueStepper.removeClass("is-offscreen");
        lastScrollY = window.pageYOffset;
        return;
      }
      if (window.pageYOffset > lastScrollY + navbarHeight) {
        $navbar.addClass("is-offscreen");
        $newIssueStepper.length > 0 &&
          $newIssueStepper.addClass("is-offscreen");
        lastScrollY = window.pageYOffset;
        return;
      }
      if (window.pageYOffset < lastScrollY - navbarHeight) {
        $navbar.removeClass("is-offscreen");
        $newIssueStepper.length > 0 &&
          $newIssueStepper.removeClass("is-offscreen");
        lastScrollY = window.pageYOffset;
        return;
      }
    }, 100);
  };

  return this.init();
}

$(function() {
  new NavBar();
});
