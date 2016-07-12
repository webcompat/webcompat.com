/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'require'
], function (intern, registerSuite, require) {
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
      .findByCssSelector('button').submit()
      //TEST adding delay for adding 2FA authcode manually
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

  return {
    login: login,
    logout: logout
  }
});
