/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to enter a URL and navigate to the next step */

import $ from "jquery";

import notify from "../notify.js";
import { isUrlValid, isEmpty } from "../validation.js";
import { extractPrettyUrl } from "../utils.js";
import { showError, showSuccess, hideSuccess } from "../ui-utils.js";
import { sendAnalyticsEvent } from "../analytics.js";

const urlField = $("#url");
const nextStepButton = $(".next-url");
const urlDesc = $("#desc-url");
const noUrlDesc = $("#desc-no-url");

const showNextStep = (id, data) => notify.publish("showStep", { id, data });

const onClick = (event) => {
  event.preventDefault();

  showNextStep("category", { url: extractPrettyUrl(urlField.val()) });
};

const handleEvent = (value, errCb) => {
  const isValid = isUrlValid(value);

  if (isValid) {
    showSuccess(urlField);
  } else {
    errCb();
  }

  nextStepButton.prop("disabled", !isValid);
};

const onChange = (value) => handleEvent(value, () => hideSuccess(urlField));

const onBlur = (value) => {
  if (!value) return;

  handleEvent(value, () =>
    showError(
      urlField,
      "Please enter a valid url starting with https:// or http://"
    )
  );
};

const updateDescription = (val) => {
  if (!isEmpty(val)) {
    urlDesc.removeClass("is-hidden");
    noUrlDesc.addClass("is-hidden");
  }
};

const initListeners = () => {
  urlField.on("input", (event) => onChange(event.target.value));
  urlField.on("blur", (event) => onBlur(event.target.value));
  nextStepButton.on("click", onClick);
};

const setInitialInputState = () => {
  if (!urlField.val()) {
    urlField.focus();
  } else {
    // trigger a change to account for existing value
    // after page refresh since Firefox is keeping form values
    urlField.trigger("input");
  }
};

initListeners();
updateDescription(urlField.val());
setInitialInputState();
sendAnalyticsEvent("url", "start");

export default {
  //this method is called when url is prefilled via postMessage or GET request
  update: ({ url }) => {
    if (!url) return;
    urlField.val(url).trigger("input").blur();
    updateDescription(url);
  },
};
