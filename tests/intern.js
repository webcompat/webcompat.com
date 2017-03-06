/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define([
  "intern",
], function(intern, topic) {
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
      pageLoadTimeout: args.wcPageLoadTimeout ? parseInt(args.wcPageLoadTimeout, 10) : 10000,
      // user and pw need to be passed in as command-line arguments. See CONTRIBUTING.md
      user: args.user || "some username",
      pw: args.pw || "some password",
    },

    // The port on which the instrumenting proxy will listen
    proxyPort: 9090,

    // A fully qualified URL to the Intern proxy
    proxyUrl: "http://127.0.0.1:9090/",
    siteRoot: siteRoot,
    tunnel: "SeleniumTunnel",
    tunnelOptions: {
      // this tells SeleniumTunnel to download geckodriver
      drivers: [ "firefox" ]
    },

    environments: [{
      browserName: "firefox",
      marionette: true
    }],

    filterErrorStack: true,
    reporters: ["Pretty"],

    // Unless you pass in a command-line arg saying otherwise, we run all tests by default.
    functionalSuites: [ "tests/functional-all" ],
    excludeInstrumentation: true
  };

});
