/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to select other browsers you have tested on */

import notify from "../notify.js";
import { showContainer, hideContainer } from "../ui-utils.js";

const container = $(".step-container.step6");
const nextStepButton = container.find("button.next-step.step-6");
const noOtherButton = container.find(".no-other-browser");
const radio = container.find("input");

const makeAStep = (id) => notify.publish("showStep", { id });
const hideStep = (id) => notify.publish("hideStep", id);

const resetRadio = (element) => {
  element.each(function () {
    $(this).prop("checked", false);
  });
};

const handleNext = (event) => {
  event.preventDefault();
  hideStep("warningBrowser");
  makeAStep("description");
};

const handleNoOther = (event) => {
  event.preventDefault();
  resetRadio(radio);
  makeAStep("warningBrowser");
};

const handleBrowserSelection = () => {
  hideStep("warningBrowser");
  nextStepButton.prop("disabled", false);
};

nextStepButton.on("click", handleNext);
noOtherButton.on("click", handleNoOther);
radio.on("change", handleBrowserSelection);

export default {
  show() {
    showContainer(container);
  },

  hide() {
    hideContainer(container, "slideupandheight");
  },
};
