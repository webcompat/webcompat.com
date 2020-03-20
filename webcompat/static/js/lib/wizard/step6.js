/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to select other browsers you have tested on */

import utils from "./utils.js";
import notify from "./notify.js";

const container = $(".step-container.step6");
const nextStepButton = container.find("button.next-step.step-6");
const noOtherButton = container.find(".no-other-browser");
const radio = container.find("input");

//@todo remove this
nextStepButton.removeClass("disabled");

const makeAStep = id => notify.publish("showStep", { id });
const hideStep = id => notify.publish("hideStep", id);

const resetRadio = element => {
  element.each(function() {
    $(this).prop("checked", false);
  });
};

const handleNext = event => {
  event.preventDefault();
  hideStep(7);
  makeAStep(8);
};

const handleNoOther = event => {
  event.preventDefault();
  resetRadio(radio);
  makeAStep(7);
};

const handleBrowserSelection = () => {
  hideStep(7);
};

nextStepButton.on("click", handleNext);
noOtherButton.on("click", handleNoOther);
radio.on("change", handleBrowserSelection);

export default {
  show() {
    utils.showContainer(container);
  },

  hide() {
    utils.hideContainer(container, "slideupandheight");
  }
};
