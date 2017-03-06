/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*eslint no-console: ["error", { allow: ["log", "error"] }] */

define([
  "intern",
  "intern!object",
  "require",
  "intern/dojo/node!leadfoot/helpers/pollUntil",
], function(intern, registerSuite, require, pollUntil) {
  "use strict";

  var config = intern.config;

  var url = function(path, params) {
    var base = intern.config.siteRoot + path;
    return params ? base + params : base;
  };

  function takeScreenshot() {
    return function() {
      return this.parent.takeScreenshot()
        .then(function(buffer) {
          console.error("Capturing base64 screenshot:");
          console.error("data:image/png,base64," + buffer.toString("base64"));
        });
    };
  }

  /*
    Use this method to make sure a page is loaded before trying to find
    things inside of it. The optional boolean longer arg at the end can
    be used for tests that need more time.
  */
  function openPage(context, url, readySelector, longerTimeout) {
    var timeout = longerTimeout ? 20000 : config.wc.pageLoadTimeout;

    return context.remote
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

          .then(takeScreenshot())

          .then(function() {
            throw err;
          });
      });
  }

  // TODO: when https://github.com/mozilla/geckodriver/issues/308 is fixed,
  // remove this ugliness.

  function login(context) {
    return openPage(context, url("/login"), "body")
      .setFindTimeout(config.wc.pageLoadTimeout)
      .getCurrentUrl()
      .then(function(url) {
        // is this the "normal" login flow?
        if (url.includes("return_to")) {
          return context.remote
            .findByCssSelector("#login_field").click()
              .type(config.wc.user)
            .end()
            .findByCssSelector("#password").click()
              .type(config.wc.pw)
            .end()
            .findByCssSelector("input[type=submit]").click()
            .end()
            // *Sometimes* GitHub can bring up an extra verification
            // page if it detects that our test user is requesting
            // access too much.
            .findByCssSelector(".oauth-review-permissions")
            .then(function() {
              // In this case, there's an extra button to click to convince
              // GitHub we're totally not a bot. >_>
              return context.remote
                .sleep(3000)
                .findByCssSelector("button.btn-primary").click()
                .end();
            }, function(err) {
              // Otherwise, we swallow the NoSuchElement error.
              return new Promise(function(resolve) {
                if (/NoSuchElement/.test(String(err))) {
                  resolve(true);
                } else {
                  throw err;
                }
              });
            })
            .end()
            // ...Now make sure the logged-in avatar is shown so we know we're
            // back at the home page before we end.
            .findByCssSelector(".wc-Navbar-avatar")
            .end();
        }
      })
      .end();
  }

  function logout(context) {
    return openPage(context, url("/logout"), "body")
           .clearCookies()
           .end()
           .get(require.toUrl("https://github.com/logout"))
           .findByCssSelector("input.btn").click()
           .end();
  }

  function visibleByClass(selector) {
    var elem;
    return pollUntil(function(selector) {
      elem = document.getElementsByClassName(selector);
      if (!elem || elem.length === 0) { return null; }
      elem = elem[0];
      return (elem.offsetWidth > 0 && elem.offsetHeight > 0) ? true : null;
    }, [ selector], 10000);
  }

  return {
    login: login,
    logout: logout,
    openPage: openPage,
    takeScreenshot: takeScreenshot,
    visibleByClass: visibleByClass
  };
});
