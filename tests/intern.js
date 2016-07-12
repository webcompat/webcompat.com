/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define(['intern/lib/args'], function(args) {
  'use strict';

  var siteRoot = args.siteRoot ? args.siteRoot : 'http://localhost:5000';

  return {
    // Configuration object for webcompat
    wc: {
      pageLoadTimeout: args.wcPageLoadTimeout ? parseInt(args.wcPageLoadTimeout, 10) : 10000,
      // user and pw need to be passed in as command-line arguments. See CONTRIBUTING.md
      user: args.user || 'some username',
      pw: args.pw || 'some password'
    },

    // The port on which the instrumenting proxy will listen
    proxyPort: 9090,

    // A fully qualified URL to the Intern proxy
    proxyUrl: 'http://127.0.0.1:9090/',
    siteRoot: siteRoot,

    // Selenium vers on BrowserStack
    capabilities: {
      'browserstack.selenium_version': '2.53.1'
    },

    // Required for BrowserStack, Maximum number of simultaneous integration tests allowed
    maxConcurrency: 2,

    environments: [
      { browser: 'firefox', browser_version: '47', os : 'OS X', os_version : 'El Capitan' },
      { browser: 'chrome', browser_version: '50', os : 'OS X', os_version : 'El Capitan' }
    ],

    //browserstack
    tunnel: 'BrowserStackTunnel',

    // Beauty, Bob.
    reporters: 'pretty',

    // Unless you pass in a command-line arg saying otherwise, we run all tests by default.
    functionalSuites: [ 'tests/functional-all' ],

    // A regular expression matching URLs to files that should not be included in code coverage analysis
    excludeInstrumentation: /./
  };

});
