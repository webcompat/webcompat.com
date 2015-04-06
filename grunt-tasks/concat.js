module.exports = function(grunt) {
  grunt.config('concat', {
      options: {
        banner: '<%= banner %>',
        stripBanners: false
      },
      dist: {
        src: [
            '<%= jsPath %>/vendor/jquery-1.11.2.min.js',
            '<%= jsPath %>/vendor/lodash.underscore-min.js',
            '<%= jsPath %>/vendor/backbone-min.js',
            '<%= jsPath %>/vendor/moment-min.js',
            '<%= jsPath %>/vendor/prism.js',
            '<%= jsPath %>/vendor/markdown-it.js',
            '<%= jsPath %>/vendor/mousetrap-min.js',
            '<%= jsPath %>/vendor/backbone.mousetrap.js',
            '<%= jsPath %>/lib/flash-message.js',
            '<%= jsPath %>/lib/homepage.js',
            '<%= jsPath %>/lib/bugform.js'
        ],
        dest: '<%= jsPath %>/<%= pkg.name %>.js'
      },
      diagnose: {
        src: [
            '<%= jsPath %>/lib/models/issue.js',
            '<%= jsPath %>/lib/diagnose.js'
        ],
        dest: '<%= jsPath %>/diagnose.js'
      },
      issues: {
        src: [
            '<%= jsPath %>/lib/models/issue.js',
            '<%= jsPath %>/lib/models/comment.js',
            '<%= jsPath %>/lib/comments.js',
            '<%= jsPath %>/lib/labels.js',
            '<%= jsPath %>/lib/issues.js',
        ],
        dest: '<%= jsPath %>/issues.js'
      },
      issueList: {
        src: [
          '<%= jsPath %>/lib/models/issue.js',
          '<%= jsPath %>/lib/issue-list.js'
        ],
        dest: '<%= jsPath %>/issue-list.js'
      }
   });
};
