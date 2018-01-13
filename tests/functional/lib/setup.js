/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const intern = require("intern").default;
const http = require("http");

var url = function(path, params) {
  var base = intern.config.siteRoot + path;
  return params ? base + params : base;
};

/* 
This method makes a call to our API and 
checks that the server is returning fixture data,
it will also check if there's anything wrong with the server.
*/

intern.registerPlugin("checkServer", function() {
  return new Promise(function(resolve, reject) {
    var request = http.get(url("/api/issues/100"), function(response) {
      response.on("data", function(data) {
        var json = JSON.parse(data);
        if (!json.hasOwnProperty("_fixture")) {
          reject(
            new Error(
              `
            =======================================================
            It seems like you didn't start the server in test mode.
            Open another terminal and window type: 
           \x1b[32m npm run start:test\x1b[0m
            or
           \x1b[32m python run.py -t\x1b[0m
            =======================================================
            `
            )
          );
        } else {
          resolve("All is well!");
        }
      });
    });

    // Handle connection errors.
    request.on("error", function() {
      reject(
        new Error(
          `
        ======================================================
        Oops, something went wrong. Try restarting the server.
        Open another terminal and window type: 
       \x1b[32m npm run start:test\x1b[0m
        or
       \x1b[32m python run.py -t\x1b[0m
        ======================================================
        `
        )
      );
    });
    request.end();
  });
});
