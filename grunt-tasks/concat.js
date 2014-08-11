module.exports = function(grunt) {
  grunt.config('concat', {
      options: {
        banner: '<%= banner %>',
        stripBanners: false
      },
      dist: {
        src: [
            '<%= jsPath %>/vendor/jquery-1.11.0.min.js',
            '<%= jsPath %>/vendor/lodash.underscore-min.js',
            '<%= jsPath %>/vendor/backbone-min.js',
            '<%= jsPath %>/vendor/moment-min.js',
            '<%= jsPath %>/vendor/prism.js',
            '<%= jsPath %>/vendor/marked-min.js',
            '<%= jsPath %>/lib/homepage.js',
            '<%= jsPath %>/lib/bugform.js',
            '<%= jsPath %>/lib/shared.js'
        ],
        dest: '<%= jsPath %>/<%= pkg.name %>.js'
      },
      issues: {
        src: [
            '<%= jsPath %>/lib/comments.js',
            '<%= jsPath %>/lib/labels.js',
            '<%= jsPath %>/lib/issues.js'
        ],
        dest: '<%= jsPath %>/issues.js'
      }
   });
};
