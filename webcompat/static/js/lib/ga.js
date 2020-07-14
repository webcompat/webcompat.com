/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function getDNTStatus() {
  // standard
  if ("doNotTrack" in navigator) {
    return navigator.doNotTrack;
  }
  // edge, ie11, safari
  if ("doNotTrack" in window) {
    return window.doNotTrack;
  }
  // ie 9 & 10
  if ("msDoNotTrack" in navigator) {
    return navigator.msDoNotTrack;
  }

  return "0";
}

if (getDNTStatus() !== "1") {
  window.ga =
    window.ga ||
    function () {
      (ga.q = ga.q || []).push(arguments);
    };
  ga.l = +new Date();
  ga("create", "UA-116539473-1", "webcompat.com");
  ga("send", "pageview");
  ga("set", "anonymizeIp", true);
}
