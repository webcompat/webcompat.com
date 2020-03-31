/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to enter description of the problem */

import notify from "../notify.js";
import { charsPercent } from "../utils.js";
import { showContainer } from "../ui-utils.js";

const MIN_CHARACTERS = 30;

const container = $(".step-container.step8");
const descriptionField = container.find("#steps_reproduce");
const progress = container.find(".problem-description .progress");
const bar = progress.find(".bar");
const nextStepButton = container.find(".next-step.step-8");

const handleNext = event => {
  event.preventDefault();
  notify.publish("showStep", { id: "screenshot" });
};

const updateProgress = percent => {
  const isReady = percent === 100;

  bar.css("width", `${percent}%`);

  if (isReady) {
    progress.addClass("complete");
  } else {
    progress.removeClass("complete");
  }

  nextStepButton.prop("disabled", !isReady);
};

const onChange = value => {
  const percent = charsPercent(value, MIN_CHARACTERS);
  updateProgress(percent);
};

descriptionField.on("blur input", event => onChange(event.target.value));
nextStepButton.on("click", handleNext);

export default {
  show() {
    showContainer(container);
  }
};
