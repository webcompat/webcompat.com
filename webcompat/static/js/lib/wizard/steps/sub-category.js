/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to select a sub category of the problem they're experiencing */

import { showContainer, hideContainer } from "../ui-utils.js";
import notify from "../notify.js";

const container = $(".step-container.step3");
const radio = container.find("input");

const showSubcategory = (subId) => {
  container.find(".choice-control").hide();
  $(`.${subId}`).show();
};

const resetRadio = (element) => {
  element.each(function () {
    $(this).prop("checked", false);
  });
};

const handleSubCategory = () =>
  notify.publish("showStep", { id: "confirmBrowser" });

radio.on("change", handleSubCategory);

export default {
  show: (data) => {
    resetRadio(radio);
    showSubcategory(data.subId);
    showContainer(container);
  },
  hide: () => {
    hideContainer(container);
  },
};
