/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";

function NavBar() {
  this.init = function () {
    this.setUpEvents();
  };

  this.setUpEvents = function () {
    this.dropDownHandler();
    this.navbarHandler();
    this.searchHandler();
  };

  this.searchHandler = function () {
    var searchBar = $(".js-SearchBar");
    var searchBarOpen = $(".js-SearchBarOpen");
    var searchBarClose = $(".js-SearchBarClose");

    searchBarOpen.click(function () {
      searchBar.addClass("is-active");
      searchBar.find("input").focus();
    });

    searchBarClose.click(function () {
      searchBar.removeClass("is-active");
      searchBar.find("input").blur();
    });
  };

  this.addShadow = function (el, scroll) {
    if (scroll > 0) {
      el.addClass("shadow");
    } else {
      el.removeClass("shadow");
    }
  };

  this.navbarHandler = function () {
    var $navbar = $(".js-navigation");
    var $newIssueStepper = $("#wizard-container");
    var navbarHeight = $navbar.outerHeight();
    var lastScrollY = window.pageYOffset;
    var scrollTimeout = null;
    var isScrolling = false;

    $(window).on(
      "scroll",
      function () {
        isScrolling = true;
        window.clearTimeout(scrollTimeout);
        scrollTimeout = window.setTimeout(function () {
          isScrolling = false;
        }, 500);

        this.addShadow($newIssueStepper, $(window).scrollTop());
      }.bind(this)
    );

    window.setInterval(function () {
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

  this.dropDownHandler = function () {
    var navDropDown = $(".js-DropdownHeader");
    navDropDown.click(function () {
      var $this = $(this);
      $this.toggleClass("is-active");
      $this.find("button").attr("aria-expanded", function () {
        return $this.hasClass("is-active") ? "true" : "false";
      });
    });

    // close dropdown if you click "outside"
    $(document).on("click", function (e) {
      if (!$(e.target).closest(navDropDown).length) {
        navDropDown.removeClass("is-active");
        navDropDown.find("button").attr("aria-expanded", "false");
      }
    });
  };

  return this.init();
}

$(function () {
  new NavBar();
});
