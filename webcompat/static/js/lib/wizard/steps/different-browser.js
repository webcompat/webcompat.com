/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to enter device/browser information if it's different from they're currently using */

import $ from "jquery";
import notify from "../notify.js";
import { isEmpty } from "../validation.js";
import {
  showContainer,
  hideContainer,
  showError,
  showSuccess,
} from "../ui-utils.js";

const BROWSER_ERROR = "Browser required";
const OS_ERROR = "OS required";

const container = $(".step-container.step-custom-browser");
const nextStepButton = container.find(".next-custom");
const browserField = container.find("#browser");
const osField = container.find("#os");

const handleNext = (event) => {
  event.preventDefault();
  notify.publish("showStep", { id: "testedBrowsers" });
};

const updateFieldState = (isValid, element, text) => {
  if (isValid) {
    showSuccess(element);
  } else {
    showError(element, text);
  }
};

const updateButtonState = (isValid) => {
  nextStepButton.prop("disabled", !isValid);
};

const onBrowserChange = (value) => {
  const isBrowserValid = !isEmpty(value);
  const isOsValid = !isEmpty(osField.val());

  updateFieldState(isBrowserValid, browserField, BROWSER_ERROR);
  //make sure button is enabled when both fields are filled
  updateButtonState(isBrowserValid && isOsValid);
};

const onOsChange = (value) => {
  const isOsValid = !isEmpty(value);
  const isBrowserValid = !isEmpty(browserField.val());

  updateFieldState(isOsValid, osField, OS_ERROR);
  //make sure button is enabled when both fields are filled
  updateButtonState(isOsValid && isBrowserValid);
};

nextStepButton.on("click", handleNext);
browserField.on("blur input", (event) => onBrowserChange(event.target.value));
osField.on("blur input", (event) => onOsChange(event.target.value));

onBrowserChange(browserField.val());
onOsChange(osField.val());

export default {
  show: () => {
    showContainer(container);
  },

  hide: () => {
    hideContainer(container);
  },
};
