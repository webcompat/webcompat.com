/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import notify from "../../notify.js";

const deleteImage = $(".js-remove-upload");

const hideDeleteImage = () => {
  deleteImage.addClass("is-hidden");
  deleteImage.attr("tabIndex", "-1");
  deleteImage.off("click");
  deleteImage.get(0).blur();
};

const removeImagePreview = (event) => {
  event.preventDefault();
  hideDeleteImage();

  notify.publish("deleteImage");
};

const showDeleteImage = () => {
  deleteImage.removeClass("is-hidden");
  deleteImage.attr("tabIndex", "0");
  deleteImage.on("click", removeImagePreview);
};

const handleUploadInProgress = () => {
  deleteImage.addClass("is-hidden");
};

export default {
  init: () => {
    notify.subscribe("saveImage", showDeleteImage);
    notify.subscribe("saveImageError", hideDeleteImage);
    notify.subscribe("uploadInProgress", handleUploadInProgress);
  },
};
