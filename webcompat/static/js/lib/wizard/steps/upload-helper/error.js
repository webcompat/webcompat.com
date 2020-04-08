/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "../../notify.js";
import { createInlineHelp } from "../../ui-utils.js";

const errEl = $(".js-error-upload");

const removeHelper = () => {
  $(".form-upload-error").remove();
};

const showUploadError = ({ errorText }) => {
  removeHelper();

  const inlineHelp = createInlineHelp(errorText, "form-upload-error");

  inlineHelp.appendTo(".js-error-upload");
  errEl.removeClass("is-hidden");
};

const hideUploadError = () => {
  removeHelper();
  errEl.addClass("is-hidden");
};

export default {
  init: () => {
    notify.subscribe("uploadError", showUploadError);
    notify.subscribe("uploadImage", hideUploadError);
  },
};
