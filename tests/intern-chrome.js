/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Local functional tests (all) on Chrome Driver (2.22)
// Prerequisite: Chrome Driver should be running before starting this test
// >chromedriver --port=4444 --url-base=wd/hub

define([
  './intern'
], function(intern) {

  intern.environments = [
    { browser: 'chrome', browser_version: '50', os : 'OS X', os_version : 'El Capitan' }//,
  ];

  intern.tunnel = 'NullTunnel';
  intern.tunnelOptions = {
    host: '127.0.0.1:4444',
    //port is not getting read so moved it into host value
    //port: '4444',
    path: '/wd/hub'
  };

  return intern;
});