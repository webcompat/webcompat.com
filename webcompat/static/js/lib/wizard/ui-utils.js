/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
const HEADER_HEIGHT = 130;

export const createInlineHelp = (text, className = "form-message-error") => {
  return $("<small></small>", {
    class: `label-icon-message ${className}`,
    text: text,
  });
};

export const scrollToElement = (element, delay = 250) => {
  // Delay "scroll to element" effect in order to let the animation finish, otherwise the scroll point isn't correct
  setTimeout(() => {
    const topOfElement =
      window.pageYOffset + element.getBoundingClientRect().top - HEADER_HEIGHT;
    $("html, body").animate({ scrollTop: topOfElement });
  }, delay);
};

export const showContainer = (container, animationName = "slidedown") => {
  container.css("animation-name", animationName);
  container.addClass("open");
  scrollToElement(container[0]);
};

export const hideContainer = (container, animationName = "slideup") => {
  container.css("animation-name", animationName);
  container.removeClass("open");
};

export const showError = (el, text) => {
  el.parents(".js-Form-group")
    .removeClass("is-validated js-no-error")
    .addClass("is-error js-form-error");

  const helper = el.parents(".js-Form-group").find(".form-message-error");

  // if the helper already in place, don't create a new one
  if (helper.length) return;

  //wrapper
  const wrapper = el.parents(".input-wrapper");

  const inlineHelp = createInlineHelp(text);
  // just in case the wrapper doesn't exist
  wrapper ? inlineHelp.insertBefore(wrapper) : inlineHelp.insertBefore(el);
};

export const showSuccess = (el) => {
  el.parents(".js-Form-group")
    .removeClass("is-error js-form-error")
    .addClass("is-validated js-no-error");

  el.parents(".js-Form-group").find(".form-message-error").remove();
};

export const hideSuccess = (el) => {
  el.parents(".js-Form-group").removeClass("is-validated js-no-error");
};

export const hideError = (el) => {
  el.parents(".js-Form-group").find(".form-message-error").remove();
};
