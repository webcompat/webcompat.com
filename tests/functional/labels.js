/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function (intern, registerSuite, assert, require) {
  'use strict';

  var url = function (num) {
    return intern.config.siteRoot + '/issues/' + num;
  };

  registerSuite({
    name: 'labels',

    'setting a label': function () {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url(100)))
        .sleep(1000)
        .findByCssSelector('.LabelEditor-launcher').click()
        .sleep(2000)
        .end()
        .findByCssSelector('label.LabelEditor-item input[name="contactready"]').click()
        .sleep(2000)
        .end()
        .findByCssSelector('span.Label')
        .then(function (text) {
          assert.include(text, 'contactready', 'Label contactready has been set');
        })
        .end();
    }
  });
});
