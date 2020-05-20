/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import notify from "../../notify.js";

const changeText = (textId) => {
  $(".up-message").hide();
  $(`.${textId}`).show();
};

const setSavedText = () => {
  changeText("uploaded-screenshot");
};

const setDeletedText = () => {
  changeText("deleted-screenshot");
};

export default {
  init: () => {
    notify.subscribe("saveImage", setSavedText);
    notify.subscribe("deleteImage", setDeletedText);
    notify.subscribe("saveImageError", setDeletedText);
  },
};
