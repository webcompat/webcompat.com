/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Allows the user to submit an issue anonymously or through github */

import { showContainer } from "../ui-utils.js";

const container = $(".step-container.step10");

export default {
  show: () => {
    showContainer(container);
  },
};
