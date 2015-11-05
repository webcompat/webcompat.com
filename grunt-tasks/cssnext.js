/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('cssnext', {
    options: {
      sourcemap: true,
      url : false,
      browsers: ['ff >= 4', 'ie >= 8', 'safari >= 5.1', 'opera >= 12', 'chrome >=10'],
      import: { path: ["node_modules"] }
    },
      dist: {
        files: {
          '<%= cssPath %>/webcompat.dev.css': '<%= cssPath %>/development/main.css'
        }
      }
   });
};
