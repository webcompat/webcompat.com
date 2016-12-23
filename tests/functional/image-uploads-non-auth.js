/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global Promise:true*/

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require',
  'intern/node_modules/dojo/node!path',
], function(intern, registerSuite, assert) {
  'use strict';

  var url = intern.config.siteRoot;

  registerSuite({
    name: 'Image Uploads (non-auth)',

    'postMessaged dataURI preview': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // send a small base64 encoded green test square
        .execute('postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")')
        .sleep(1000)
        .findByCssSelector('.js-image-upload-label').getAttribute('style')
        .then(function(inlineStyle) {
          assert.include(inlineStyle, 'data:image/png;base64,iVBOR', 'Base64 data shown as preview background');
        })
        .end();
    },

    'postMessaged blob preview': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // Build up a green test square in canvas, toBlob that, and then postMessage the blob
        .execute(function() {
          return new Promise(function(res) {
            var c = document.createElement('canvas');
            c.width = 25;
            c.height = 25;
            var ctx = c.getContext('2d');
            ctx.fillStyle = 'rgb(0, 128, 0)';
            ctx.rect(0, 0, 25, 25);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.strokeRect(0, 0, 25, 25);
            c.toBlob(function(blob) {
              res(blob);
            });
          }).then(function(blob) {
            postMessage(blob, 'http://localhost:5000');
          });
        })
        .sleep(1000)
        .findByCssSelector('.js-image-upload-label').getAttribute('style')
        .then(function(inlineStyle) {
          assert.include(inlineStyle, 'data:image/png;base64,iVBOR', 'Base64 data shown as preview background');
        })
        .end();
    },

    'postMessaged dataURI image upload worked': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // send a small base64 encoded green test square
        .execute('postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")')
        .sleep(1000)
        .findByCssSelector('#description').getProperty('value')
        .then(function(val) {
          assert.include(val, '![Screenshot Description](http://localhost:5000/uploads/', 'The data URI was correctly uploaded and its URL was copied to the bug description.');
        })
        .end();
    },

    'postMessaged blob image upload worked': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // Build up a green test square in canvas, toBlob that, and then postMessage the blob
        .execute(function() {
          return new Promise(function(res) {
            var c = document.createElement('canvas');
            c.width = 25;
            c.height = 25;
            var ctx = c.getContext('2d');
            ctx.fillStyle = 'rgb(0, 128, 0)';
            ctx.rect(0, 0, 25, 25);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.strokeRect(0, 0, 25, 25);
            c.toBlob(function(blob) {
              res(blob);
            });
          }).then(function(blob) {
            postMessage(blob, 'http://localhost:5000');
          });
        })
        .sleep(1000)
        .findByCssSelector('#description').getProperty('value')
        .then(function(val) {
          assert.include(val, '![Screenshot Description](http://localhost:5000/uploads/', 'The data URI was correctly uploaded and its URL was copied to the bug description.');
        })
        .end();
    },

    'remove image upload button': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // send a small base64 encoded green test square
        // in theory a blob should work as well, since by the time we're removing the image,
        // it's been converted to a data URI
        .execute('postMessage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAIAAABLixI0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3gYSAig452t/EQAAAClJREFUOMvtzkENAAAMg0A25ZU+E032AQEXoNcApCGFLX5paWlpaWl9dqq9AS6CKROfAAAAAElFTkSuQmCC", "http://localhost:5000")')
        .sleep(1000)
        .findByCssSelector('.js-image-upload-label .wc-UploadForm-button').isDisplayed()
        .then(function(isDisplayed) {
          assert.equal(isDisplayed, true, 'Remove button is displayed');
        })
        .end()
        .findByCssSelector('.js-image-upload-label .wc-UploadForm-button').click()
        .end()
        .findByCssSelector('.js-image-upload-label').getAttribute('style')
        .then(function(inlineStyle) {
          assert.notInclude(inlineStyle, 'data:image/png;base64,iVBOR', 'Preview was removed');
        })
        .end()
        .findByCssSelector('#description').getProperty('value')
        .then(function(val) {
          assert.notInclude(val, '![Screenshot Description](http://localhost:5000/uploads/', 'The url to the image upload was correctly removed.');
        })
        .end();
    }
  });
});
