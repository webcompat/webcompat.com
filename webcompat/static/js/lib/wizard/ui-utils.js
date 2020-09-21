/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import anime from "animejs/lib/anime.es.js";

const HEADER_HEIGHT = 130;
const SPACING = 24;

export const createInlineHelp = (text, className = "form-message-error") => {
  return $("<small></small>", {
    class: `label-icon-message ${className}`,
    text: text,
  });
};

export const scrollToElement = (element) => {
  const topOfElement =
    window.pageYOffset +
    element.getBoundingClientRect().top -
    HEADER_HEIGHT -
    SPACING;

  anime({
    targets: [document.documentElement, document.body],
    scrollTop: topOfElement,
    duration: 300,
    easing: "linear",
  });
};

export const showContainer = (container, cb) => {
  const domElement = container[0];
  const startPosition = container.hasClass("open") ? 0 : "-100%";
  return anime({
    easing: "linear",
    duration: 300,
    targets: domElement,
    keyframes: [
      { translateY: startPosition },
      { opacity: 1, zIndex: 0, translateY: 0 },
    ],
    begin: () => {
      domElement.style.display = "flex";
    },
    complete: () => {
      container.addClass("open");
      scrollToElement(domElement);
      if (cb) cb();
    },
  });
};

export const hideContainer = (container) => {
  const domElement = container[0];
  return anime({
    easing: "linear",
    duration: 300,
    targets: domElement,
    keyframes: [
      { zIndex: -1 },
      { opacity: 0, zIndex: -1, translateY: "-100%" },
    ],
    begin: () => {
      domElement.style.display = "none";
    },
    complete: () => {
      container.removeClass("open");
    },
  });
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

export const addKeyDownListeners = (container, altTarget = null) => {
  const labels = container.find("label");
  labels.on("keydown", (e) => {
    if (e.originalEvent.code === "Enter") {
      e.preventDefault();
      let target = altTarget ? altTarget : e.target;
      target.click();
    }
  });
};
