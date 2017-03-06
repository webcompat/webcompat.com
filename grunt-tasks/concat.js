/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config("concat", {
    options: {
      banner: "<%= banner %>",
      stripBanners: false
    },
    dist: {
      src: [
        "<%= jsPath %>/vendor/jquery-1.11.2.min.js",
        "<%= jsPath %>/vendor/lodash.custom.min.js",
        "<%= jsPath %>/vendor/backbone-min.js",
        "<%= jsPath %>/vendor/moment-min.js",
        "<%= jsPath %>/vendor/prism.js",
        "<%= jsPath %>/vendor/markdown-it.js",
        "<%= jsPath %>/vendor/markdown-it-emoji-1.0.0.js",
        "<%= jsPath %>/vendor/markdown-it-sanitizer-0.4.1.js",
        "<%= jsPath %>/vendor/mousetrap-min.js",
        "<%= jsPath %>/vendor/backbone.mousetrap.js",
        "<%= jsPath %>/lib/flash-message.js",
        "<%= jsPath %>/lib/homepage.js",
        "<%= jsPath %>/lib/bugform.js"
      ],
      dest: "<%= jsPath %>/<%= pkg.name %>.js"
    },
    diagnose: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/labels.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/diagnose.js"
      ],
      dest: "<%= jsPath %>/diagnose.js"
    },
    issues: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/labels.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/models/comment.js",
        "<%= jsPath %>/lib/comments.js",
        "<%= jsPath %>/lib/issues.js",
      ],
      dest: "<%= jsPath %>/issues.js"
    },
    issueList: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/labels.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/mixins/pagination.js",
        "<%= jsPath %>/lib/issue-list.js"
      ],
      dest: "<%= jsPath %>/issue-list.js"
    },
    userActivity: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/mixins/pagination.js",
        "<%= jsPath %>/lib/user-activity.js"
      ],
      dest: "<%= jsPath %>/user-activity.js"
    },
    cssFixmeLibs: {
      src: [
        "git_modules/css-fixme/js/css-browserside.js",
        "git_modules/css-fixme/js/css-fixme.js",
        "<%= jsPath %>/lib/css-fixme-ui.js"
      ],
      dest: "<%= jsPath %>/cssfixme.js"
    }
  });
};
