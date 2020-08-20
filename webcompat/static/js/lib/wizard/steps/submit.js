/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint new-cap: ["error", { "capIsNewExceptions": ["Deferred"] }]*/

/* Allows the user to submit an issue anonymously or through github */

import $ from "jquery";
import { showContainer } from "../ui-utils.js";
import { uploadConsoleLogs } from "./upload-helper/console-logs-upload.js";
import { uploadImage } from "./upload-helper/image-upload.js";
import { sendAnalyticsEvent } from "../analytics.js";

const container = $(".step-container.step-submit");
const form = $("#js-ReportForm form");
const submitButtons = $("#js-ReportForm .js-Button");
const submitTypeField = $("#submit_type:hidden");
const loadingIndicator = $(".js-loader");

const showLoadingIndicator = function () {
  loadingIndicator.addClass("is-active");
};

const hideLoadingIndicator = function () {
  loadingIndicator.removeClass("is-active");
};

const disableSubmits = () => {
  submitButtons.prop("disabled", true);
};

const enableSubmits = () => {
  submitButtons.prop("disabled", false);
};

const submitForm = function () {
  const dfd = $.Deferred();
  const formEl = form.get(0);

  formEl.submit();
  dfd.resolve();
  return dfd.promise();
};

const onFormSubmit = (event) => {
  event.preventDefault();
  sendAnalyticsEvent("success", "end");
  disableSubmits();
  showLoadingIndicator();
  uploadConsoleLogs().always(() => uploadImage().then(submitForm));
};

// Calling submit() manually on the form won't contain details
// about which <button> was clicked (since one wasn't clicked).
// So we send that with the form data via a hidden input.
const saveSubmitType = (event) => {
  submitTypeField.val(event.target.name);
};

submitButtons.on("click", saveSubmitType);
form.on("submit", onFormSubmit);

export default {
  show: () => {
    showContainer(container);
  },
  update: () => {
    // if there is an update triggered on this step,
    // assume there was an error with uploading the image
    hideLoadingIndicator();
    enableSubmits();
  },
};
