/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Local functional tests (all) for Firefox/Selenium Driver
// Prerequisite: Selenium Driver should be running

define([
  './intern'
], function(intern) {

  intern.environments = [
    { browserName: 'firefox'}
  ];

  intern.tunnel = 'NullTunnel';
  intern.tunnelOptions = {};

  return intern;
});