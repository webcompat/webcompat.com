/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint new-cap: ["error", { "capIsNewExceptions": ["Deferred"] }]*/

/*
   Upload the image before form submission so we can
   put an image link in the bug description.
*/

import $ from "jquery";
import notify from "../../notify.js";
import { wcEvents } from "../../../flash-message.js";
import { getDataURIFromPreview } from "../../utils.js";

const previewEl = $(".js-image-upload");

const addImageURL = ({ url }) => {
  if (!url) return;
  notify.publish("updateStep", { id: "description", data: { url } });
};

const handleUploadError = function (response) {
  if (response && response.status === 415) {
    wcEvents.trigger("flash:error", {
      message:
        "Image must be one of the following: jpe, jpg, jpeg, png, gif, or bmp.",
      timeout: 5000,
    });
  }

  if (response && response.status === 413) {
    wcEvents.trigger("flash:error", {
      message:
        "The image is too big! Please choose something smaller than 4MB.",
      timeout: 5000,
    });
  }

  notify.publish("updateStep", { id: "submit" });
  notify.publish("deleteImage");
};

const resolveEarly = () => {
  const dfd = $.Deferred();
  return dfd.resolve();
};

export const uploadImage = () => {
  const bgImage = previewEl.get(0).style.backgroundImage;

  if (!bgImage || bgImage === "none") {
    return resolveEarly();
  }

  const dataURI = getDataURIFromPreview(bgImage);

  if (!dataURI) {
    return resolveEarly();
  }

  notify.publish("uploadInProgress");

  const formdata = new FormData();
  formdata.append("image", dataURI);

  return $.ajax({
    contentType: false,
    processData: false,
    data: formdata,
    method: "POST",
    url: "/upload/",
    success: addImageURL,
    error: handleUploadError,
  });
};
