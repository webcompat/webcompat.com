/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import utils from "./utils.js";
import notify from "./notify.js";

const container = $(".step-container.step7");
const nextStepButton = container.find(".next-step.step-7");

const handleNext = event => {
  event.preventDefault();
  notify.publish("showStep", { id: 7 });
};

nextStepButton.on("click", handleNext);

export default {
  show() {
    utils.showContainer(container);
  },

  hide() {
    utils.hideContainer(container, "slideupandheight");
  }
};
