/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Showing a warning if user hasn't tested on any other browsers */

import $ from "jquery";
import { showContainer, hideContainer } from "../ui-utils.js";
import notify from "../notify.js";

const container = $(".step-container.step-warning");
const nextStepButton = container.find(".next-warning");

const handleNext = (event) => {
  event.preventDefault();
  notify.publish("showStep", { id: "description" });
};

nextStepButton.on("click", handleNext);

export default {
  show: () => {
    showContainer(container);
  },

  hide: () => {
    hideContainer(container, "slideupandheight");
  },
};
