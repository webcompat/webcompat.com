/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import notify from "./notify.js";
import { STEPS } from "./steps/index.js";

const hideStep = (id) => {
  STEPS[id].module.hide();
};

const showStep = (message) => {
  const { id, data } = message;
  const step = STEPS[id];
  step.module.show(data);
};

const updateStep = (message) => {
  const { id, data } = message;
  const step = STEPS[id];
  step.module.update(data);
};

export default {
  init: () => {
    notify.subscribe("showStep", (message) => showStep(message));
    notify.subscribe("hideStep", (id) => hideStep(id));
    notify.subscribe("updateStep", (message) => updateStep(message));
  },
};
