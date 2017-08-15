/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint no-console: ["error", { allow: ["log", "error"] }] */

define(["intern", "intern!object", "require"], function(
  intern,
  registerSuite,
  require
) {
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
  async function openPage(context, url, readySelector, longerTimeout) {
    let timeout = longerTimeout ? 20000 : config.wc.pageLoadTimeout;
    let remote = context.remote;
    try {
      await remote.get(require.toUrl(url));
      await remote.setFindTimeout(timeout);
      await remote.findByCssSelector(readySelector);
    } catch (error) {
      let url = await remote.getCurrentUrl();
      console.log("Error fetching %s", url);
      throw new Error(error);
    }
  }

  async function login(context) {
    return await openPage(context, url("/login"), "body");
  }

  async function logout(context) {
    return await openPage(context, url("/logout"), "body");
  }

  return {
    login: login,
    logout: logout,
    openPage: openPage
  };
});
