/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { parseGetParams } from "./helpers/getParamParser.js";
import { onMessageReceived } from "./helpers/postMessageParser.js";

export default {
  init: () => {
    // This module supports form prefilling with GET params or postMessage
    document.addEventListener("DOMContentLoaded", parseGetParams);
    window.addEventListener("message", onMessageReceived, false);
  },
};
