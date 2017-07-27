/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file is only included in the page when the Flask view is rendered with
// a flash message. It's responsible for triggering that message as defined
// in flash-message.js. See layout.html for how category and message data
// attributes are set.

var currentScript = document.currentScript;
if (currentScript) {
  var category = currentScript.dataset.category || "";
  var message = currentScript.dataset.message || "";

  wcEvents.trigger("flash:" + category, { message: message, timeout: 4000 });
}
