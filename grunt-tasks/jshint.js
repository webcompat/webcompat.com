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
          issueNumber: true,
          marked: true,
          moment: true
        }
      },
      beforeconcat: [
        '<%= jsPath %>/lib/homepage.js',
        '<%= jsPath %>/lib/bugform.js',
        '<%= jsPath %>/lib/issues.js',
        '<%= jsPath %>/lib/shared.js'
      ]
  });

};