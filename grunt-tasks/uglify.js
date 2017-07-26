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
      dest: "<%= jsPath %>/<%= pkg.name %>.min.js"
    },
    issues: {
      src: "<%= concat.issues.dest %>",
      dest: "<%= jsPath %>/issues.min.js"
    },
    issueList: {
      src: "<%= concat.issueList.dest %>",
      dest: "<%= jsPath %>/issue-list.min.js"
    },
    userActivity: {
      src: "<%= concat.userActivity.dest %>",
      dest: "<%= jsPath %>/user-activity.min.js"
    },
    diagnose: {
      src: "<%= concat.diagnose.dest %>",
      dest: "<%= jsPath %>/diagnose.min.js"
    },
    cssFixmeLibs: {
      src: "<%= concat.cssFixmeLibs.dest %>",
      dest: "<%= jsPath %>/cssfixme.min.js"
    }
  });
};
