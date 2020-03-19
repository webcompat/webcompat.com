/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "./notify.js";

const urlField = $("#url");
const nextStepButton = $(".next-step.step-1");

//@todo remove this
nextStepButton.removeClass("disabled");

const extractPrettyUrl = url => {
  const pathArray = $.trim(url).split("/");
  return pathArray[2];
};

const checkUrl = () => nextStepButton.removeClass("disabled");
const showStep = (id, data) => notify.publish("showStep", { id, data });

const makeAStep = event => {
  event.preventDefault();
  showStep(1, { url: extractPrettyUrl(urlField.val()) });
};

urlField.on("blur input", checkUrl);
nextStepButton.on("click", makeAStep);

export default {};
