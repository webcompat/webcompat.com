/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define(["intern"], function(intern, topic) {
  "use strict";
  var args = intern.args;
  var siteRoot = args.siteRoot ? args.siteRoot : "http://localhost:5000";

  if (topic) {
    topic.subscribe("/suite/start", function(suite) {
      /* eslint-disable no-console*/
      console.log("Running: " + suite.name);
    });
  }

  return {
    // Configuration object for webcompat
    wc: {
      pageLoadTimeout: args.wcPageLoadTimeout
        ? parseInt(args.wcPageLoadTimeout, 10)
        : 10000
    },

    // The port on which the instrumenting proxy will listen
    proxyPort: 9090,

    // A fully qualified URL to the Intern proxy
    proxyUrl: "http://127.0.0.1:9090/",
    siteRoot: siteRoot,

    capabilities: {
      //"browserstack.local": false for running tests on travis
      "browserstack.local": true,
      "browserstack.video": false,
      fixSessionCapabilities: false
    },

    // Required for BrowserStack, maximum number of simultaneous integration tests allowed
    maxConcurrency: 2,

    environments: [
      {
        browser: "firefox",
        browser_version: "54",
        os: "OS X",
        os_version: "Sierra"
      },
      {
        browser: "chrome",
        browser_version: "59",
        os: "OS X",
        os_version: "Sierra"
      }
    ],

    tunnel: "BrowserStackTunnel",
    tunnelOptions: {
      verbose: true,
      username: args.BROWSERSTACK_USERNAME,
      accessKey: args.BROWSERSTACK_ACCESS_KEY
    },

    filterErrorStack: true,
    reporters: ["Pretty"],

    // Unless you pass in a command-line arg saying otherwise, we run all tests by default.
    functionalSuites: ["tests/functional-all"],
    excludeInstrumentation: true
  };
});
