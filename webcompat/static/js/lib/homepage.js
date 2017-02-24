/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function HomePage() {
  var reportButton = $("#js-ReportBug");
  var reportLink = $("#report-bug-link");
  var formContainer = $("#js-ReportForm");
  var searchBar = $(".js-SearchBar");
  var searchBarOpen = $(".js-SearchBarOpen");
  var searchBarClose = $(".js-SearchBarClose");
  var navDropDown = $(".wc-Navbar-link.wc-DropdownHeader");


  this.init = function() {
    reportButton.add(reportLink).on("click", this.toggleForm);
    var htmlClass = ("ontouchstart" in window || "createTouch" in document) ?
                     "touch" : "no-touch";
    document.documentElement.classList.add(htmlClass);

    // Open the form if we've got open=1 param in the URL
    if (formContainer.hasClass("is-closed") &&
        location.search.search(/open=1/) > -1) {
      reportButton.click();
    }

    this.setUpEvents();
  };

  this.setUpEvents = function() {
    this.searchHandler();
    this.dropDownHandler();
  };

  this.searchHandler = function() {
    searchBarOpen.click(function() {
      searchBar.addClass("is-active");
      searchBar.find("input").focus();
    });

    searchBarClose.click(function() {
      searchBar.removeClass("is-active");
      searchBar.find("input").blur();
    });
  };

  this.dropDownHandler = function() {
    navDropDown.click(function() {
      var $this = $(this);
      $this.toggleClass("is-active");
      $this.attr("aria-pressed", function() {
        return $this.hasClass("is-active") ? "true" : "false";
      });
    });

    // close dropdown if you click "outside"
    $(document).on("click", function(e) {
      if (!$(e.target).closest(navDropDown).length) {
        navDropDown.removeClass("is-active");
      }
    });
  };

  this.toggleForm = function(e) {
    e.preventDefault();
    $("html, body").animate({
      scrollTop: reportButton.offset().top + 5
    }, 250);

    if (reportButton.hasClass("is-open")) {
      $("html, body").animate({
        scrollTop: 0
      }, 250);
    }
    reportButton.toggleClass("is-closed")
                .toggleClass("is-open");
    formContainer.slideToggle(function() {
      formContainer.toggleClass("is-closed")
                   .toggleClass("is-opened");
    });
  };

  return this.init();
}

$(function() {
  new HomePage();
});
