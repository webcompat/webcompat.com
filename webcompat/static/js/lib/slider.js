/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function Slider() {
  this.init = function() {
    this.setUpEvents();
  };

  this.setUpEvents = function() {
    this.sliderHandler();
  };

  this.sliderHandler = function() {
    var nextBtn = document.querySelectorAll(".slider .next");
    var prevBtn = document.querySelectorAll(".slider .prev");
    var dot = document.querySelectorAll(".slider .dot");
    var slide = document.querySelectorAll(".slider .slides .slide");
    var controlNext = document.querySelector(".slider .controls .next");
    var controlFinish = document.querySelector(
      ".slider .controls .close-control"
    );
    // Intercepted popup close buttons that trigger the return to first slide
    var closeButtons = document.querySelectorAll(".popup-modal__close");
    var index = 0;

    var setActiveControls = function(index) {
      var selectedDot = document.querySelector(".slider .dot.active");
      selectedDot.classList.remove("active");
      dot.forEach(function(d) {
        if (index === $(d).data("slide")) {
          d.classList.add("active");
        }
      });
      if (index === slide.length - 1) {
        controlNext.style.display = "none";
        controlFinish.style.display = "block";
      } else {
        controlNext.style.display = "block";
        controlFinish.style.display = "none";
      }
    };

    prevBtn.forEach(function(btn) {
      btn.addEventListener("click", function() {
        index--;
        if (index < 0) {
          index = 0;
          return false;
        }
        slide[index + 1].classList.remove("active");
        slide[index].classList.add("active");
        setActiveControls(index);
      });
    });

    nextBtn.forEach(function(btn) {
      btn.addEventListener("click", function() {
        index++;
        if (index >= slide.length) {
          index--;
          return false;
        }
        slide[index - 1].classList.remove("active");
        slide[index].classList.add("active");
        setActiveControls(index);
      });
    });

    dot.forEach(function(d) {
      d.addEventListener("click", function() {
        slide[index].classList.remove("active");
        index = $(d).data("slide");
        slide[index].classList.add("active");
        setActiveControls(index);
      });
    });

    closeButtons.forEach(function(btn) {
      btn.addEventListener("click", function() {
        slide[index].classList.remove("active");
        index = 0;
        slide[index].classList.add("active");
        dot[index].click();
        setActiveControls(index);
      });
    });
  };

  return this.init();
}

$(function() {
  new Slider();
});
