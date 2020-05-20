/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint new-cap: ["error", { "capIsNewExceptions": ["Deferred"] }]*/

/*
   Upload console logs before form submission so we can
   put a link to it in the hidden field.
*/

import $ from "jquery";
import notify from "../../notify.js";

const detailsInput = $("#details:hidden");

const addConsoleLogsUrl = ({ url }) => {
  if (!url) return;
  const value = location.origin + "/console_logs/" + url;
  const toUpdate = {
    data: { elementId: "#console_logs_url:hidden", value },
    single: true,
  };
  notify.publish("updateStep", { id: "hidden", data: toUpdate });
};

export const uploadConsoleLogs = () => {
  const details = JSON.parse(detailsInput.val());

  if (!details || !details.consoleLog) {
    const dfd = $.Deferred();
    return dfd.resolve();
  }

  const formdata = new FormData();
  formdata.append("console_logs", JSON.stringify(details.consoleLog));

  return $.ajax({
    contentType: false,
    processData: false,
    data: formdata,
    method: "POST",
    url: "/upload/",
    success: addConsoleLogsUrl,
  });
};
