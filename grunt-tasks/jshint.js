/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config('jshint', {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        scripturl: true,
        globals: {
          jQuery: true,
          $: true,
          _: true,
          Backbone: true,
          console: true,
          define: true,
          issueNumber: true,
          markdownitEmoji: true,
          markdownitSanitizer: true,
          md: true,
          moment: true,
          Mousetrap: true,
          PaginationMixin: true,
          Prism: true,
          qr: true,
          repoPath: true,
          wcEvents: true
        }
      },
      tests: [
        'tests/functional/*.js'
      ],
      beforeconcat: [
        '<%= jsPath %>/lib/*.js'
      ]
  });

};
