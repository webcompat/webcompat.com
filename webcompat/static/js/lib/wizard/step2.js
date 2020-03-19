/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import utils from "./utils.js";
import notify from "./notify.js";

const container = $(".step-container.step2");
const detectionBug = $("#problem_category-0");
const siteBug = $("#problem_category-1");
const layoutBug = $("#problem_category-2");
const videoBug = $("#problem_category-3");
const unknownBug = $("#problem_category-4");
const sitePrettyUrl = $("#website-url");
const otherProblem = $(".other-problem");
const nextStepButton = $(".next-step.step-2");

//@todo remove this
nextStepButton.removeClass("disabled");

const showUnknown = () =>
  otherProblem.css("animation-name", "slidedownandheight");
const hideUnknown = () =>
  otherProblem.css("animation-name", "slideupandheight");

const showStep = (id, data) => notify.publish("showStep", { id, data });
const hideStep = id => notify.publish("hideStep", id);

const handleDetectionBug = () => {
  hideUnknown();
  hideStep(2);
  showStep(3);
};

const handleBugWithSubCategory = event => {
  hideUnknown();
  const subId = `${event.target.value}_subcategory`;
  showStep(2, { subId });
};

const handleUnknownBug = () => {
  showUnknown();
  hideStep(2);
  hideStep(3);
};

const handleNextStep = event => {
  event.preventDefault();
  showStep(3);
};

const setUrl = url => sitePrettyUrl.text(url);

const initListeners = () => {
  detectionBug.on("change", handleDetectionBug);
  siteBug.on("change", handleBugWithSubCategory);
  layoutBug.on("change", handleBugWithSubCategory);
  videoBug.on("change", handleBugWithSubCategory);
  unknownBug.on("change", handleUnknownBug);
  nextStepButton.on("click", handleNextStep);
};

initListeners();

export default {
  show(data) {
    setUrl(data.url);
    utils.showContainer(container);
  }
};
