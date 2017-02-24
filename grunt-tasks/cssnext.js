/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config("postcss", {
    options: {
      map: true,
      processors: [
        require("postcss-import")(),
        require("postcss-cssnext")({
          browsers: ["ff >= 20", "ie >= 10", "safari >= 7", "opera >= 12", "chrome >=30"],
        }),
        require("postcss-browser-reporter")(),
        require("postcss-reporter")(),
      ]
    },
    dist: {
      files: {
        "<%= cssPath %>/webcompat.dev.css": "<%= cssPath %>/development/main.css"
      }
    }
  });
};
