/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import utils from "./utils.js";
import notify from "./notify.js";

const container = $(".step-container.step6");
const nextStepButton = container.find("button.next-step.step-6");
const noOtherButton = container.find(".no-other-browser");

//@todo remove this
nextStepButton.removeClass("disabled");

const makeAStep = id => notify.publish("showStep", { id });
const hideStep = id => notify.publish("hideStep", id);

const handleNext = event => {
  event.preventDefault();
  hideStep(6);
  makeAStep(7);
};

const handleNoOther = event => {
  event.preventDefault();
  makeAStep(6);
};

nextStepButton.on("click", handleNext);
noOtherButton.on("click", handleNoOther);

export default {
  show() {
    utils.showContainer(container);
  },

  hide() {
    utils.hideContainer(container, "slideupandheight");
  }
};
