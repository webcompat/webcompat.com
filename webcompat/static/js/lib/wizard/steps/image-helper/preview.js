/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import notify from "../../notify.js";

const previewEl = $(".js-image-upload");
const uploadLabel = $(".js-label-upload");

const showPreview = ({ dataURI }) => {
  previewEl.css({
    background: "url(" + dataURI + ") no-repeat center / cover",
  });

  uploadLabel.addClass("visually-hidden");
};

const hidePreview = () => {
  previewEl.css("background", "none");
  uploadLabel.removeClass("visually-hidden").removeClass("is-hidden");
};

const handleError = () => {
  previewEl.css("background", "none");
  uploadLabel.addClass("is-hidden");
};

export default {
  init: () => {
    notify.subscribe("saveImage", showPreview);
    notify.subscribe("deleteImage", hidePreview);
    notify.subscribe("saveImageError", handleError);
  },
};
