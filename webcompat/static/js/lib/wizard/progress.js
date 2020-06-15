/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import $ from "jquery";
import notify from "./notify.js";
import { STEPS } from "./steps/index.js";

const setProgress = (progressId) => {
  const currentId = `#pr-${progressId}`;
  const currentEl = $(currentId);

  currentEl.prevAll(".step").removeClass("active").addClass("complete");
  currentEl.removeClass("complete").addClass("active");
  currentEl.nextAll(".step").removeClass("active").removeClass("complete");
};

const setProgressByStep = (id) => {
  if (id in STEPS && "progress" in STEPS[id]) {
    setProgress(STEPS[id].progress);
  }
};

const setProgressById = (id) => {
  setProgress(id);
};

export default {
  init: () => {
    notify.subscribe("showStep", ({ id }) => setProgressByStep(id));
    // Manually set progress here for cases when progress update
    // is not triggered by showStep
    notify.subscribe("setProgress", ({ id }) => setProgressById(id));
  },
};
