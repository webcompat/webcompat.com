/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file is only included in the page when the Flask view is rendered with
// a flash message. It's responsible for triggering that message as defined
// in flash-message.js. See layout.html for how category and message data
// attributes are set.

import $ from "jquery";
import { wcEvents } from "./flash-message.js";

const showMessage = (el) => {
  const category = el.getAttribute("data-category");
  const message = el.getAttribute("data-message");
  if (category && message) {
    wcEvents.trigger("flash:" + category, { message: message, timeout: 4000 });
  }
};

const messagesEl = $(".flashed-message");

if (messagesEl.length) {
  messagesEl.each((i, el) => showMessage(el));
}
