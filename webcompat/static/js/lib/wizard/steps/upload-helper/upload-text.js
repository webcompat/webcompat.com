/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "../../notify.js";

const changeUploadText = textId => {
  $(".up-message").hide();
  $(`.${textId}`).show();
};

const setUploadedText = () => {
  changeUploadText("uploaded-screenshot");
};

const setDeletedText = () => {
  changeUploadText("deleted-screenshot");
};

export default {
  init: () => {
    notify.subscribe("uploadImage", setUploadedText);
    notify.subscribe("deleteImage", setDeletedText);
    notify.subscribe("uploadError", setDeletedText);
  }
};
