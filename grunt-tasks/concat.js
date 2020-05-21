/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.config("concat", {
    options: {
      banner: "<%= banner %>",
      stripBanners: false,
    },
    dist: {
      src: [
        "<%= jsPath %>/vendor/jquery-3.3.1.min.js",
        "<%= jsPath %>/vendor/lodash.custom.min.js",
        "<%= jsPath %>/vendor/backbone-1.3.3.min.js",
        "<%= jsPath %>/vendor/moment-min.js",
        "<%= jsPath %>/vendor/prism.js",
        "<%= jsPath %>/vendor/mousetrap-min.js",
        "<%= jsPath %>/vendor/backbone.mousetrap.js",
        "<%= jsPath %>/lib/flash-message.js",
        "<%= jsPath %>/lib/autogrow-textfield.js",
        "<%= jsPath %>/lib/bugform-validation.js",
        "<%= jsPath %>/lib/bugform-prefill.js",
        "<%= jsPath %>/lib/bugform.js",
        "<%= jsDistPath %>/templates.js",
        "<%= jsPath %>/lib/navbar.js",
      ],
      dest: "<%= jsDistPath %>/<%= pkg.name %>.js",
    },
    distFormV2: {
      src: [
        "<%= jsPath %>/vendor/jquery-3.3.1.min.js",
        "<%= jsPath %>/vendor/lodash.custom.min.js",
        "<%= jsPath %>/vendor/backbone-1.3.3.min.js",
        "<%= jsPath %>/vendor/moment-min.js",
        "<%= jsPath %>/vendor/prism.js",
        "<%= jsPath %>/vendor/mousetrap-min.js",
        "<%= jsPath %>/vendor/backbone.mousetrap.js",
        "<%= jsPath %>/lib/flash-message.js",
        "<%= jsPath %>/lib/autogrow-textfield.js",
        "<%= jsPath %>/lib/bugform-validation.js",
        "<%= jsPath %>/lib/bugform-prefill.js",
        "<%= jsPath %>/lib/issue-wizard-popup.js",
        "<%= jsPath %>/lib/issue-wizard-slider.js",
        "<%= jsDistPath %>/templates.js",
        "<%= jsPath %>/lib/navbar.js",
      ],
      dest: "<%= jsDistPath %>/<%= pkg.name %>.formv2.js",
    },
    index: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/untriaged.js",
      ],
      dest: "<%= jsDistPath %>/index.js",
    },
    issues: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/editor.js",
        "<%= jsPath %>/lib/labels.js",
        "<%= jsPath %>/lib/models/milestones.js",
        "<%= jsPath %>/lib/milestones.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/autogrow-textfield.js",
        "<%= jsPath %>/lib/issues.js",
      ],
      dest: "<%= jsDistPath %>/issues.js",
    },
    issueList: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/mixins/pagination.js",
        "<%= jsPath %>/lib/issue-list.js",
      ],
      dest: "<%= jsDistPath %>/issue-list.js",
    },
    userActivity: {
      src: [
        "<%= jsPath %>/lib/models/label-list.js",
        "<%= jsPath %>/lib/models/issue.js",
        "<%= jsPath %>/lib/mixins/pagination.js",
        "<%= jsPath %>/lib/user-activity.js",
      ],
      dest: "<%= jsDistPath %>/user-activity.js",
    },
  });
};
