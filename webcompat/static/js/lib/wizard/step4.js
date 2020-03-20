/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to confirm the browser and device they're experiencing the problem on */

import utils from "./utils.js";
import notify from "./notify.js";

const container = $(".step-container.step4");
const nextStepButton = container.find(".next-step.step-4");
const otherOption = container.find(".next-step.step-5");

const makeAStep = id => notify.publish("showStep", { id });
const hideStep = id => notify.publish("hideStep", id);

const handleNext = event => {
  event.preventDefault();
  hideStep(5);
  makeAStep(6);
};

const handleOther = event => {
  event.preventDefault();
  hideStep(6);
  makeAStep(5);
};

nextStepButton.on("click", handleNext);
otherOption.on("click", handleOther);

export default {
  show() {
    utils.showContainer(container);
  },

  hide() {
    utils.hideContainer(container);
  }
};
