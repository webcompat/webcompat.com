/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint no-console: ["error", { allow: ["log", "error"] }] */

define(
  ["intern", "intern!object", "require", "intern/dojo/node!http"],
  function(intern, registerSuite, require, http) {
    "use strict";
    var config = intern.config;

    var url = function(path, params) {
      var base = intern.config.siteRoot + path;
      return params ? base + params : base;
    };

    /*
    Use this method to make sure a page is loaded before trying to find
    things inside of it. The optional boolean longer arg at the end can
    be used for tests that need more time.
  */
    function openPage(context, url, readySelector, longerTimeout) {
      var timeout = longerTimeout ? 20000 : config.wc.pageLoadTimeout;

      return (
        context.remote
          .get(require.toUrl(url))
          .setFindTimeout(timeout)
          // Wait until the `readySelector` element is found to return.
          .findByCssSelector(readySelector)
          .end()
          .then(null, function(err) {
            return context.remote
              .getCurrentUrl()
              .then(function(resultUrl) {
                console.log("Error fetching %s", resultUrl);
              })
              .end()
              .then(function() {
                throw err;
              });
          })
      );
    }

    /* 
    This method makes a call to our API to check that the server is returning fixture data,
    it will also check if there's anything wrong with the server.
  */
    function checkServer() {
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
    }

    function login(context) {
      return openPage(context, url("/login"), "body").end();
    }

    function logout(context) {
      return openPage(context, url("/logout"), "body").clearCookies().end();
    }

    return {
      openPage: openPage,
      checkServer: checkServer,
      login: login,
      logout: logout
    };
  }
);
