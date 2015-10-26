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
        '<%= jsPath %>/lib/bugform.js',
        '<%= jsPath %>/lib/comments.js',
        '<%= jsPath %>/lib/diagnose.js',
        '<%= jsPath %>/lib/flash-message.js',
        '<%= jsPath %>/lib/homepage.js',
        '<%= jsPath %>/lib/models/label-list.js',
        '<%= jsPath %>/lib/labels.js',
        '<%= jsPath %>/lib/issues.js',
        '<%= jsPath %>/lib/issue-list.js',
        '<%= jsPath %>/lib/models/comment.js',
        '<%= jsPath %>/lib/models/issue.js',
        '<%= jsPath %>/lib/qrCode.js',
      ]
  });

};
