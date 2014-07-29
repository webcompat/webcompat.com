module.exports = function(grunt) {
  grunt.config('uglify', {
      options: {
        banner: '<%= banner %>',
        mangle: false
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= jsPath %>/<%= pkg.name %>.min.js'
      },
      issues: {
        src: '<%= concat.issues.dest %>',
        dest: '<%= jsPath %>/issues.min.js'
      }
   });
};
