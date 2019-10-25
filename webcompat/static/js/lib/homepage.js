/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function HomePage() {
  var searchBar = $(".js-SearchBar");
  var searchBarOpen = $(".js-SearchBarOpen");
  var searchBarClose = $(".js-SearchBarClose");

  this.init = function() {
    var htmlClass =
      "ontouchstart" in window || "createTouch" in document
        ? "touch"
        : "no-touch";

    document.documentElement.classList.add(htmlClass);
    this.setUpEvents();
  };

  this.setUpEvents = function() {
    this.searchHandler();
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

  return this.init();
}

$(function() {
  new HomePage();
});
