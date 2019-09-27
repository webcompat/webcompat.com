/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function Popup() {
  this.init = function() {
    this.setUpEvents();
  };

  this.setUpEvents = function() {
    this.popupHandler();
  };

  this.popupHandler = function() {
    var modalTriggers = document.querySelectorAll(".popup-trigger");
    var overlay = document.querySelector(".popup-overlay");
    var closeButtons = document.querySelectorAll(".popup-modal__close");
    modalTriggers.forEach(function(trigger) {
      trigger.addEventListener("click", function(e) {
        e.preventDefault();
        var popupTrigger = trigger.dataset.popupTrigger;
        var popupModal = document.querySelector(
          '[data-popup-modal="'.concat(popupTrigger, '"]')
        );
        popupModal.classList.add("is--visible");
        overlay.classList.add("is-blacked-out");
        closeButtons.forEach(function(btn) {
          btn.addEventListener("click", function() {
            popupModal.classList.remove("is--visible");
            overlay.classList.remove("is-blacked-out");
          });
        });
      });
    });
  };

  return this.init();
}

$(function() {
  new Popup();
});
