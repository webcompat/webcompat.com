/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to select other browsers you have tested on */

import $ from "jquery";
import notify from "../notify.js";
import {
  addKeyDownListeners,
  hideContainer,
  showContainer,
} from "../ui-utils.js";

const BROWSER_ICON_MAP = {
  Chrome: "chrome",
  "Chrome Headless": "chrome",
  Edge: "edge",
  Firefox: "firefox",
  IE: "internet_explorer",
  "Mobile Safari": "safari",
  Opera: "opera",
  Safari: "safari",
};

const container = $(".step-container.step-tested-browsers");
const nextStepButton = container.find("button.next-tested");
const noOtherButton = container.find(".no-other-browser");
const radio = container.find("[name=tested_browsers]");
const testedOtherRadio = container.find("#browser_test-0");
const notTestedOtherRadio = container.find("#browser_test-1");

const makeAStep = (id) => notify.publish("showStep", { id });
const hideStep = (id) => notify.publish("hideStep", id);

const resetBrowserSelection = (element) => {
  element.each(function () {
    $(this).prop("checked", false);
  });
};

const handleNext = (event) => {
  event.preventDefault();
  hideStep("warningBrowser");
  makeAStep("description");
};

const handleNoOther = (event) => {
  event.preventDefault();
  resetBrowserSelection(radio);
  makeAStep("warningBrowser");
  notTestedOtherRadio.prop("checked", true);
};

const handleBrowserSelection = () => {
  hideStep("warningBrowser");
  nextStepButton.prop("disabled", false);
  testedOtherRadio.prop("checked", true);
};

const initListeners = () => {
  nextStepButton.on("click", handleNext);
  noOtherButton.on("click", handleNoOther);
  radio.on("change", handleBrowserSelection);
  addKeyDownListeners(container);
};

const hideCurrentBrowser = ({ browser }) => {
  const browserId = BROWSER_ICON_MAP[browser];

  if (!browserId) return;

  const toHide = $(`#browser-${browserId}`);
  if (toHide.length) {
    toHide.parents("li").hide();
  }
};

const showAllBrowsers = () => {
  $("#tested_browsers").children("li").show();
};

initListeners();

export default {
  show: (data) => {
    if (data) {
      if ("browser" in data) {
        hideCurrentBrowser(data);
      }

      if ("showAll" in data) {
        showAllBrowsers();
      }
    }

    showContainer(container);
  },

  hide: () => {
    hideContainer(container);
  },
};
