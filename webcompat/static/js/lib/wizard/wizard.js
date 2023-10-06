/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import stepper from "./stepper.js";
import prefill from "./prefill.js";
import progress from "./progress.js";

// Set a window variable to let the in-browser reporting tool
// know that the site is ready for the postMessage
let wrtResolve;
window.wrtReady = new Promise((r) => {
  wrtResolve = r;
});

prefill.init(wrtResolve);
stepper.init();
progress.init();
