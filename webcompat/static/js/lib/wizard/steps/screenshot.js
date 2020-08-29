/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to upload an image or continue without it.

*  The image saved as Base64-encoded format and used as a
*  background image on the preview element and only uploaded
*  to the server when the form is submitted.
*/

import $ from "jquery";
import notify from "../notify.js";
const UPLOAD_LIMIT = 1024 * 1024 * 4;
const ERROR_TEXT =
  "Image must be one of the following: jpe, jpg, jpeg, png, gif, or bmp.";

import {
  isImageTypeValid,
  blobOrFileTypeValid,
  isImageDataURIValid,
} from "../validation.js";
import { addKeyDownListeners, showContainer } from "../ui-utils.js";
import { downsampleImage, convertToDataURI } from "../utils.js";
import imageHelper from "./image-helper/index.js";

const container = $(".step-container.step-screenshot");
const nextStepButton = container.find(".next-screenshot");
const uploadField = container.find("#image");

const onClick = (event) => {
  event.preventDefault();
  notify.publish("showStep", { id: "submit" });
};

const addPreviewBackground = (dataURI) => {
  if (!isImageDataURIValid(dataURI)) {
    return;
  }

  notify.publish("saveImage", { dataURI });
  nextStepButton.text("Continue");
};

const showImagePreview = (dataURI) => {
  // The final size of Base64-encoded binary data is ~equal to
  // 1.37 times the original data size + 814 bytes (for headers).
  // so, bytes = (encoded_string.length - 814) / 1.37)
  // see https://en.wikipedia.org/wiki/Base64#MIME

  if (String(dataURI).length - 814 / 1.37 > UPLOAD_LIMIT) {
    downsampleImage(
      dataURI,
      // Recurse until it's small enough for us to upload.
      (downSampledData) => showImagePreview(downSampledData)
    );
  } else {
    addPreviewBackground(dataURI);
  }
};

const processSaving = (file) => {
  convertToDataURI(file, showImagePreview);
};

const handleDelete = () => {
  uploadField.val(uploadField.get(0).defaultValue);
  nextStepButton.text("Continue without");
};

const handleError = () => {
  notify.publish("saveImageError", { errorText: ERROR_TEXT });
  handleDelete();
};

const onChange = (event) => {
  // Bail if there's no image.
  if (!event.target.value) {
    return;
  }

  // We can just grab the 0th one, because we only allow uploading
  // a single image at a time (for now)
  const file = event.target.files[0];

  if (isImageTypeValid(event.target.value) && blobOrFileTypeValid(file)) {
    processSaving(file);
  } else {
    handleError();
  }

  // null out input.value so we get a consistent
  // change event across browsers
  if (event) {
    event.target.value = null;
  }
};

const addListeners = () => {
  uploadField.on("change", onChange);
  nextStepButton.on("click", onClick);
  notify.subscribe("deleteImage", handleDelete);
  addKeyDownListeners(container, uploadField);
};

addListeners();
imageHelper.init();

export default {
  show: () => {
    showContainer(container);
  },
  update: ({ dataURI }) => {
    showImagePreview(dataURI);
  },
};
