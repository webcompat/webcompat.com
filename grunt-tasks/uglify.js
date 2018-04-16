/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config("uglify", {
    options: {
      banner: "<%= banner %>",
      mangle: false
    },
    dist: {
      src: "<%= concat.dist.dest %>",
      dest: "<%= jsPath %>/dist/<%= pkg.name %>.min.js"
    },
    ga: {
      src: "<%= jsPath %>/lib/ga.js",
      dest: "<%= jsPath %>/build/ga.js"
    },
    issues: {
      src: "<%= concat.issues.dest %>",
      dest: "<%= jsPath %>/dist/issues.min.js"
    },
    issueList: {
      src: "<%= concat.issueList.dest %>",
      dest: "<%= jsPath %>/dist/issue-list.min.js"
    },
    userActivity: {
      src: "<%= concat.userActivity.dest %>",
      dest: "<%= jsPath %>/dist/user-activity.min.js"
    },
    diagnose: {
      src: "<%= concat.diagnose.dest %>",
      dest: "<%= jsPath %>/dist/diagnose.min.js"
    },
    contributors: {
      src: "<%= jsPath %>/lib/contributors.js",
      dest: "<%= jsPath %>/dist/contributors.min.js"
    }
  });
};
