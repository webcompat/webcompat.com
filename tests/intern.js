/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.

define(["intern"], function(intern) {
  "use strict";
  var args = intern.args;
  var siteRoot = args.siteRoot ? args.siteRoot : "http://localhost:5000";

  var environments = [];
  var browsers = args.browsers
    ? args.browsers.replace(/\s/g, "").split(",")
    : ["chrome", "firefox"];

  browsers.forEach(function(b) {
    environments.push({
      browserName: b.toLowerCase(),
      marionette: true
    });
  });

  return {
    // Configuration object for webcompat
    wc: {
      pageLoadTimeout: args.wcPageLoadTimeout
        ? parseInt(args.wcPageLoadTimeout, 10)
        : 10000
    },

    setup: function() {
      define("FunctionalHelpers", ["tests/functional/lib/helpers"], function(
        FunctionalHelpers
      ) {
        return {
          checkServer: FunctionalHelpers.checkServer
        };
      });
      var serverPromise;
      require(["FunctionalHelpers"], function(FunctionalHelpers) {
        serverPromise = FunctionalHelpers.checkServer();
      });
      return serverPromise;
    },

    // The port on which the instrumenting proxy will listen
    proxyPort: 9090,

    // A fully qualified URL to the Intern proxy
    proxyUrl: "http://127.0.0.1:9090/",
    siteRoot: siteRoot,
    tunnel: "SeleniumTunnel",
    tunnelOptions: {
      // this tells SeleniumTunnel to download geckodriver and chromedriver
      drivers: ["firefox", "chrome"]
    },

    // Only one browser at a time. Takes longer, but gets less intermittent errors.
    maxConcurrency: 1,

    environments: environments,

    filterErrorStack: true,
    reporters: ["Pretty"],

    // Unless you pass in a command-line arg saying otherwise, we run all tests by default.
    functionalSuites: ["tests/functional-all"],
    excludeInstrumentation: true
  };
});
