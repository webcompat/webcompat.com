/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to confirm the browser and device they're experiencing the problem on */

import $ from "jquery";
import { showContainer, hideContainer } from "../ui-utils.js";
import notify from "../notify.js";

const container = $(".step-container.step-browser");
const nextStepButton = container.find(".next-browser");
const otherOption = container.find(".next-custom");

const makeAStep = (id) => notify.publish("showStep", { id });
const hideStep = (id) => notify.publish("hideStep", id);

const handleNext = (event) => {
  event.preventDefault();
  hideStep("differentBrowser");
  makeAStep("testedBrowsers");
};

const handleOther = (event) => {
  event.preventDefault();
  hideStep("testedBrowsers");
  makeAStep("differentBrowser");
};

nextStepButton.on("click", handleNext);
otherOption.on("click", handleOther);

export default {
  show: () => {
    showContainer(container);
  },

  hide: () => {
    hideContainer(container);
  },
};
