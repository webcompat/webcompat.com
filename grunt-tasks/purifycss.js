/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config("purifycss", {
    options: {
      rejected: true,
      info: true
    },
    target: {
      src: [
        "webcompat/templates/*.html",
        "webcompat/templates/**/*.html",
        "webcompat/templates/**/*.jst",
        "webcompat/static/js/*.js"
      ],
      css: ["webcompat/static/css/*.css", "webcompat/static/css/src/*.css"],
      dest: "tmp/purestyles.css"
    }
  });
};
