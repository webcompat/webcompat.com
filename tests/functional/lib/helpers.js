/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require',
  'intern/dojo/node!leadfoot/helpers/pollUntil',
], function(intern, registerSuite, require, pollUntil) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  function login(context) {
    return context.remote
      .setFindTimeout(intern.config.wc.pageLoadTimeout)
      .get(require.toUrl(url('/login')))
      .findByCssSelector('#login_field').click()
      .type(intern.config.wc.user)
      .end()
      .findByCssSelector('#password').click()
      .type(intern.config.wc.pw)
      .end()
      .findByCssSelector('input[type=submit]').submit()
      .end()
      // *Sometimes* GitHub can bring up an extra verification
      // page if it detects that our test user is requesting
      // access too much. In that case, there's an extra button to click.
      // Otherwise, there won't be so we swallow the NoSuchElement error.
      .findByCssSelector('button.btn-primary').then(function(el) {
        el.click();
      }, function(err) {
        return new Promise(function(resolve) {
          if (/NoSuchElement/.test(String(err))) {
            resolve(true);
          }
        });
      })
      .sleep(10000)
      .end();
  }

  function logout(context) {
    return context.remote
      .setFindTimeout(intern.config.wc.pageLoadTimeout)
      .get(require.toUrl(url('/logout')))
      .end()
      .clearCookies()
      .end()
      .get(require.toUrl('https://github.com/logout'))
      .findByCssSelector('.auth-form-body input.btn').click()
      .end();
  }

  // stolen from https://github.com/mozilla/fxa-content-server/blob/03debc1145f09ea78b85bca045b867cf1a39e9bb/tests/functional/lib/helpers.js
  function visibleByQSA(selector, options) {
    options = options || {};
    var timeout = options.timeout || 10000;

    return pollUntil(function(selector, options) {
      var $matchingEl = $(selector);

      if ($matchingEl.length === 0) {
        return null;
      }

      if ($matchingEl.length > 1) {
        throw new Error('Multiple elements matched. Make a more precise selector - ' + selector);
      }

      if (!$matchingEl.is(':visible')) {
        return null;
      }

      if ($matchingEl.is(':animated')) {
        // If the element is animating, try again after a delay. Clicks
        // do not always register if the element is in the midst of
        // an animation.
        return null;
      }

      // build in a tiny delay
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve(true);
        }, 100);
      });
    }, [ selector, options ], timeout);
  }

  return {
    login: login,
    logout: logout,
    visibleByQSA: visibleByQSA
  };
});
