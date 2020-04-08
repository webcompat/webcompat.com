/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "../../notify.js";

const removeUpload = $(".js-remove-upload");

const hideRemoveUpload = () => {
  removeUpload.addClass("is-hidden");
  removeUpload.attr("tabIndex", "-1");
  removeUpload.off("click");
  removeUpload.get(0).blur();
};

const removeUploadPreview = (event) => {
  event.preventDefault();
  hideRemoveUpload();

  notify.publish("deleteImage");
};

const showRemoveUpload = () => {
  removeUpload.removeClass("is-hidden");
  removeUpload.attr("tabIndex", "0");
  removeUpload.on("click", removeUploadPreview);
};

export default {
  init: () => {
    notify.subscribe("uploadImage", showRemoveUpload);
    notify.subscribe("uploadError", hideRemoveUpload);
  },
};
