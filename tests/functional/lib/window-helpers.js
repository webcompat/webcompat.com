/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This file exists to create helpers methods for things that Selenium
// cannot do easily via tests, but should be called from tests.
// These methods will only be available if config['LOCALHOST'] is True.

/* eslint-disable no-unused-vars, no-undef */
var WindowHelpers = {
  getBlob: function (targetOrigin) {
    return new Promise(function (resolve, reject) {
      var c = document.createElement("canvas");
      c.width = 25;
      c.height = 25;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "rgb(0, 128, 0)";
      ctx.rect(0, 0, 25, 25);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.strokeRect(0, 0, 25, 25);
      try {
        c.toBlob(function (blob) {
          resolve({ blob, targetOrigin });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  },

  sendBlobInObject: function (args) {
    return new Promise(function (res) {
      postMessage({ screenshot: args.blob, message: {} }, args.targetOrigin);
      res();
    });
  },

  sendBlob: function (args) {
    return new Promise(function (res) {
      postMessage(args.blob, args.targetOrigin);
      res();
    });
  },

  sendEvent: function (elm, type) {
    elm.dispatchEvent(new Event(type), { bubbles: true });
  },
};
