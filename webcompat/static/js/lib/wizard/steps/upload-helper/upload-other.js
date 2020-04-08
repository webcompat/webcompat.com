/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "../../notify.js";

const hideUploadOther = () => {
  $(".upload-other").addClass("is-hidden");
};

const showUploadOther = () => {
  $(".upload-other").removeClass("is-hidden");
};

export default {
  init: () => {
    notify.subscribe("deleteImage", hideUploadOther);
    notify.subscribe("uploadError", hideUploadOther);
    notify.subscribe("uploadImage", showUploadOther);
  }
};
