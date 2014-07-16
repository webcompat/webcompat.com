module.exports = function(grunt) {
  grunt.config('watch', {
      css:{
        files: '<%= cssPath %>/development/**/*.css',
        tasks: ['css']
      },
      script:{
        files: '<%= jshint.beforeconcat %>',
        tasks: ['jshint:beforeconcat']
      }
   });
};
