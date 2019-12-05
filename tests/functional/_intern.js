/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const args = require("yargs").argv;
const intern = require("intern").default;

const siteRoot = args.siteRoot ? args.siteRoot : "http://localhost:5000";

let environments = [];
const browsers = args.browsers
  ? args.browsers.replace(/\s/g, "").split(",")
  : ["firefox", "chrome"];

browsers.forEach(function(b) {
  if (b.toLowerCase() === "chrome") {
    environments.push({
      browserName: b.toLowerCase(),
      chromeOptions: {
        args: ["headless", "disable-gpu"]
      }
    });
  }

  if (b.toLowerCase() === "firefox") {
    environments.push({
      browserName: b.toLowerCase(),
      marionette: true
    });
  }
});

const config = {
  // Configuration object for webcompat
  wc: {
    pageLoadTimeout: args.wcPageLoadTimeout
      ? parseInt(args.wcPageLoadTimeout, 10)
      : 10000
  },

  plugins: "./tests/functional/lib/setup.js",

  maxConcurrency: 1,

  // The port on which the instrumenting proxy will listen
  proxyPort: 9090,

  // A fully qualified URL to the Intern proxy
  proxyUrl: "http://127.0.0.1:9090/",
  siteRoot: siteRoot,
  tunnel: "selenium",
  tunnelOptions: {
    // this tells SeleniumTunnel to download geckodriver and chromedriver
    drivers: [
      "firefox",
      {
        name: "chrome",
        version: "2.44"
      }
    ]
  },
  capabilities: {
    "moz:firefoxOptions": {
      args: ["-headless"],
      prefs: {
        // work around geckodriver 0.19 bug
        // that prevents pollUntil from working
        "security.csp.enable": false
      }
    }
  },

  environments: environments,

  filterErrorStack: true,
  reporters: [args.reporters ? args.reporters : "pretty"],

  functionalSuites: [
    args.functionalSuites ? args.functionalSuites : "./tests/functional/*.js"
  ]
};

if (args.grep) {
  config.grep = new RegExp(args.grep, "i");
}

// custom Firefox binary location, if specified then the default is ignored.
// ref: https://code.google.com/p/selenium/wiki/DesiredCapabilities#WebDriver
if (args.firefoxBinary) {
  config.capabilities["moz:firefoxOptions"].binary = args.firefoxBinary;
}

// clear out the headless options arguments
if (args.showBrowser) {
  config.capabilities["moz:firefoxOptions"].args = [];
  config.environments.forEach(obj => {
    if (obj.browserName === "chrome") {
      obj.chromeOptions.args = [];
    }
  });
}

intern.configure(config);

try {
  intern.run().then(
    () => {
      console.log("it started, yay!");
    },
    err => {
      console.log("something bad happened inside intern.run()");
      console.log(err);
      process.exit(1);
    }
  );
} catch (e) {
  console.log("caught an error!");
  console.log(e);
  process.exit(1);
}
