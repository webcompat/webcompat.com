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
      dest: "<%= jsDistPath %>/<%= pkg.name %>.min.js"
    },
    ga: {
      src: "<%= jsPath %>/lib/ga.js",
      dest: "<%= jsDistPath %>/ga.js"
    },
    issues: {
      src: "<%= concat.issues.dest %>",
      dest: "<%= jsDistPath %>/issues.min.js"
    },
    issueList: {
      src: "<%= concat.issueList.dest %>",
      dest: "<%= jsDistPath %>/issue-list.min.js"
    },
    userActivity: {
      src: "<%= concat.userActivity.dest %>",
      dest: "<%= jsDistPath %>/user-activity.min.js"
    },
    untriaged: {
      src: "<%= concat.untriaged.dest %>",
      dest: "<%= jsDistPath %>/untriaged.min.js"
    },
    contributors: {
      src: "<%= jsPath %>/lib/contributors.js",
      dest: "<%= jsDistPath %>/contributors.min.js"
    },
    ab: {
      src: "<%= jsDistPath %>/ab.js",
      dest: "<%= jsDistPath %>/ab.min.js"
    }
  });
};
