/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Local functional tests (all) for Firefox/Selenium Driver
// Prerequisite: Selenium Driver should be running

define([
  './intern'
], function(intern) {

  intern.functionalSuites = [
    'tests/functional-nonauth'
  ];

  intern.environments = [
    { browserName: 'firefox'}
  ];

  intern.tunnel = 'Tunnel';
  intern.tunnelOptions = {
    //port is not getting read so moved it into host value
    host: '127.0.0.1:4444',
    path: '/wd/hub'
  };

  return intern;
});