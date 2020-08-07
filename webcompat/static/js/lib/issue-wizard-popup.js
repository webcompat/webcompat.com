/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import Mousetrap from "Mousetrap";
import { sendAnalyticsEvent } from "./wizard/analytics.js";

function Popup() {
  this.init = function () {
    this.closeButtons = document.querySelectorAll(".popup-modal__close");
    this.modalTriggers = document.querySelectorAll(".popup-trigger");
    this.overlay = document.querySelector(".popup-overlay");

    this.setUpEvents();
  };

  this.setUpEvents = function () {
    this.modalTriggers.forEach(
      function (trigger) {
        trigger.addEventListener("click", this.openModal.bind(this));
      }.bind(this)
    );

    this.closeButtons.forEach(
      function (btn) {
        btn.addEventListener("click", this.closeModal.bind(this));
      }.bind(this)
    );

    Mousetrap.bind("esc", this.closeModal.bind(this));
  };

  this.openModal = function (e) {
    e.preventDefault();

    var popupTrigger = e.target.dataset.popupTrigger;
    var popupModal = document.querySelector(
      '[data-popup-modal="'.concat(popupTrigger, '"]')
    );
    sendAnalyticsEvent(
      // transform trigger into camelCase and send as our event
      popupTrigger.replace(/-([a-z])/g, function (match) {
        return match[1].toUpperCase();
      }),
      "click"
    );
    popupModal.classList.add("is--visible");
    this.overlay.classList.add("is-blacked-out");
  };

  this.closeModal = function () {
    var popupModal = document.querySelector(".popup-modal.is--visible");
    if (popupModal && this.overlay.classList.contains("is-blacked-out")) {
      popupModal.classList.remove("is--visible");
      this.overlay.classList.remove("is-blacked-out");
    }
  };

  return this.init();
}

$(function () {
  new Popup();
});
