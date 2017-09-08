/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(function() {
  var lightElm = $(".js-Hero-svg");
  var sections = $(".contributors__item__content");
  var ACTIVE_CLASS = "is-active";
  var OPEN_CLASS = "is-open";
  $(".contributors__item__title").click(function() {
    $(this)
      .find(".contributors__item__btn")
      .toggleClass(ACTIVE_CLASS)
      .closest(".contributors__item")
      .find(".contributors__item__content")
      .toggleClass(OPEN_CLASS);
    lightElm.toggleClass(ACTIVE_CLASS, sections.hasClass("is-open"));
  });

  // if the page was loaded with a hash, it's probably an id for linking so let's
  // try to open the right section and scroll there.
  var id;
  if ((id = location.hash)) {
    if (!$(id).find(".contributors__item__btn").hasClass(ACTIVE_CLASS)) {
      $(id).parent().trigger("click");
    }
    window.scrollTo(0, $(id).offset().top);
  }
});
