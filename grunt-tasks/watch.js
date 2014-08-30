module.exports = function(grunt) {
  grunt.config('watch', {
      css:{
        files: '<%= cssPath %>/development/**/*.css',
        tasks: ['cssnext']
      },
      script:{
        files: '<%= jshint.beforeconcat %>',
        tasks: ['jshint:beforeconcat']
      }
   });
};
