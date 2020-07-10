/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to select a sub category of the problem they're experiencing */

import $ from "jquery";
import { showContainer, hideContainer } from "../ui-utils.js";
import notify from "../notify.js";

const container = $(".step-container.step-subproblem");
const radio = container.find("input");

const showSubcategory = (subId, cb) => {
  container.find(".choice-control").hide();
  $(`.${subId}`).show(0, cb);
};

const resetRadio = (element) => {
  element.each(function () {
    $(this).prop("checked", false);
  });
};

const updateDescription = (target) => {
  const text = $(target).next("label").text().trim();
  const toUpdate = {
    data: { elementId: "#description", value: text },
    single: true,
  };
  notify.publish("updateStep", { id: "hidden", data: toUpdate });
};

const handleSubCategory = (event) => {
  updateDescription(event.currentTarget);
  notify.publish("showStep", { id: "confirmBrowser" });
};

radio.on("change", handleSubCategory);

export default {
  show: (data) => {
    resetRadio(radio);
    showSubcategory(data.subId, () => showContainer(container));
  },
  hide: () => {
    hideContainer(container);
  },
};
