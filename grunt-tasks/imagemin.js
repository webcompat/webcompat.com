/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config("imagemin", {
    png: {
      options: {
        optimizationLevel: 7
      },
      files: [{
        expand: true,
        cwd:    "<%= imgPath %>/",
        src:    ["*.png"],
        dest:   "<%= imgPath %>/"
      }]
    },
    jpg: {
      options: {
        progressive: true
      },
      files: [{
        expand: true,
        cwd:    "<%= imgPath %>/",
        src:    ["*.jpg"],
        dest:   "<%= imgPath %>/"
      }]
    }
  });
};
