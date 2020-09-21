/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to select a category of the problem they're experiencing */

import $ from "jquery";
import notify from "../notify.js";
import { isEmpty } from "../validation.js";
import {
  addKeyDownListeners,
  hideSuccess,
  showContainer,
  showSuccess,
} from "../ui-utils.js";

const container = $(".step-container.step-category");
const detectionBug = $("#problem_category-0");
const siteBug = $("#problem_category-1");
const layoutBug = $("#problem_category-2");
const videoBug = $("#problem_category-3");
const unknownBug = $("#problem_category-4");
const sitePrettyUrl = $("#website-url");
const otherProblem = $(".other-problem");
const nextStepButton = $(".next-category");
const otherProblemField = $("#other_problem");

const showUnknown = () => {
  otherProblem.css("animation-name", "slidedownandheight");
  otherProblemField.focus();
};
const hideUnknown = () =>
  otherProblem.css("animation-name", "slideupandheight");

const showStep = (id, data) => notify.publish("showStep", { id, data });
const hideStep = (id) => notify.publish("hideStep", id);
const updateStep = (id, data) =>
  notify.publish("updateStep", { id: "hidden", data });
const setProgress = (id) => notify.publish("setProgress", { id });

const updateDescription = (text) => {
  const toUpdate = {
    data: { elementId: "#description", value: text },
    single: true,
  };
  updateStep("hidden", toUpdate);
};

const handleDetectionBug = (event) => {
  const text = $(event.currentTarget).next("label").text().trim();
  updateDescription(text);
  hideUnknown();
  hideStep("subCategory");
  showStep("confirmBrowser");
};

const handleBugWithSubCategory = (event) => {
  hideUnknown();
  const subId = `${event.target.value}_subcategory`;
  showStep("subCategory", { subId });
};

const handleUnknownBug = () => {
  showUnknown();
  hideStep("subCategory");
  hideStep("confirmBrowser");
  setProgress("issue");
};

const onChange = (event) => {
  const isValid = !isEmpty(event.target.value);

  if (isValid) {
    showSuccess(otherProblemField);
  } else {
    hideSuccess(otherProblemField);
  }

  nextStepButton.prop("disabled", !isValid);
};

const handleNextStep = (event) => {
  event.preventDefault();

  const otherProblemValue = otherProblemField.val();
  updateDescription(otherProblemValue);
  showStep("confirmBrowser");
};

const setUrl = (url) => sitePrettyUrl.text(url);

const updateSelection = (value) => {
  if (!value) return;

  const radio = $(`[value="${value}"]`);
  if (radio.length) radio.prop("checked", true);
};

const triggerChangeOnSelected = () => {
  const checkedEl = $("input[name=problem_category]:checked");
  if (checkedEl.length) checkedEl.trigger("change");
};

const initListeners = () => {
  detectionBug.on("change", handleDetectionBug);
  siteBug.on("change", handleBugWithSubCategory);
  layoutBug.on("change", handleBugWithSubCategory);
  videoBug.on("change", handleBugWithSubCategory);
  unknownBug.on("change", handleUnknownBug);
  otherProblemField.on("blur input", onChange);
  nextStepButton.on("click", handleNextStep);
  addKeyDownListeners(container);
};

initListeners();

export default {
  show: (data) => {
    setUrl(data.url);
    showContainer(container, triggerChangeOnSelected);
  },
  update: ({ categoryName }) => {
    updateSelection(categoryName);
  },
};
