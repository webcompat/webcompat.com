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
        globals: {
          jQuery: true,
          $: true,
          _: true,
          Backbone: true,
          console: true,
          define: true,
          issueNumber: true,
          marked: true,
          moment: true,
          Mousetrap: true,
          Prism: true,
          repoPath: true,
          wcEvents: true
        }
      },
      tests: [
        'tests/functional/lib/*.js'
      ],
      beforeconcat: [
        '<%= jsPath %>/lib/homepage.js',
        '<%= jsPath %>/lib/bugform.js',
        '<%= jsPath %>/lib/models/comment.js',
        '<%= jsPath %>/lib/comments.js',
        '<%= jsPath %>/lib/labels.js',
        '<%= jsPath %>/lib/models/issue.js',
        '<%= jsPath %>/lib/issues.js',
        '<%= jsPath %>/lib/issue-list.js',
        '<%= jsPath %>/lib/diagnose.js',
        '<%= jsPath %>/lib/flash-message.js'
      ]
  });

};
