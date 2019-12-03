/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function consoleLogs() {
  function getFileName(url) {
    return (
      url
        .split("#")[0]
        .split("?")[0]
        .split("/")
        .pop() || url
    );
  }

  function buildLogUrl(message) {
    var filename = getFileName(message.uri);

    return (
      "<div class='log-file'><a href='" +
      message.uri +
      "'>" +
      filename +
      ":" +
      message.pos +
      "</a></div>"
    );
  }

  function buildLogMessage(message) {
    return (
      "<div class='log-message'>" +
      message.log.join(", ") +
      "</div>" +
      buildLogUrl(message)
    );
  }

  function showError() {
    $("#container").append(
      "<div class='log-error'>There was an error with retrieving console logs.</div>"
    );
  }

  function buildLogs(data) {
    var str = "<div>";
    data.forEach(function(log) {
      str +=
        "<div class='log level-" +
        log.level +
        "'>" +
        buildLogMessage(log) +
        "</div>";
    });
    str += "</div>";

    $("#container").append(str);
  }

  function getLogs(url) {
    return $.ajax({
      method: "GET",
      url: "/uploads/" + url
    });
  }

  function getLogsUrl() {
    var element = $("#console_logs_data");
    return element.data("subpath") + "/" + element.data("file-id") + ".json";
  }

  getLogs(getLogsUrl()).then(buildLogs, showError);
}

$(function() {
  consoleLogs();
});
