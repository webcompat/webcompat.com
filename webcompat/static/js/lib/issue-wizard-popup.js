/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import Mousetrap from "Mousetrap";
import { sendAnalyticsEvent } from "./wizard/analytics.js";

class Popup {
  constructor() {
    this.activeSlide = null;
    this.closeButtons = document.querySelectorAll(".popup-modal__close");
    this.modalTriggers = document.querySelectorAll(".popup-trigger");
    this.overlay = document.querySelector(".popup-overlay");

    this.setUpEvents();
  }

  setUpEvents() {
    this.modalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", this.openModal.bind(this));
    });

    this.closeButtons.forEach((btn) => {
      btn.addEventListener("click", this.closeModal.bind(this));
    });

    Mousetrap.bind("esc", this.closeModal.bind(this));
    Mousetrap.bind("left", this.slideLeft.bind(this));
    Mousetrap.bind("right", this.slideRight.bind(this));
  }

  openModal(e) {
    e.preventDefault();
    const popupTrigger = e.target.dataset.popupTrigger;
    const popupModal = document.querySelector(
      `[data-popup-modal="${popupTrigger}"]`
    );
    sendAnalyticsEvent(
      // transform trigger into camelCase and send as our event
      popupTrigger.replace(/-([a-z])/g, (match) => {
        return match[1].toUpperCase();
      }),
      "click"
    );
    popupModal.classList.add("is--visible");
    this.overlay.classList.add("is-blacked-out");
    this.activeSlide = document.querySelector(".dot.active");
  }

  closeModal() {
    const popupModal = document.querySelector(".popup-modal.is--visible");
    if (popupModal && this.overlay.classList.contains("is-blacked-out")) {
      popupModal.classList.remove("is--visible");
      this.overlay.classList.remove("is-blacked-out");
    }
  }

  slideLeft() {
    const slideNumber = this.activeSlide.dataset.slide;
    if (slideNumber > 0) {
      this.activeSlide = this.activeSlide.previousElementSibling;
      this.activeSlide.click();
    }
  }

  slideRight() {
    const slideNumber = this.activeSlide.dataset.slide;
    if (slideNumber < 2) {
      this.activeSlide = this.activeSlide.nextElementSibling;
      this.activeSlide.click();
    }
  }
}

$(function () {
  new Popup();
});
