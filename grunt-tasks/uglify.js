module.exports = function(grunt) {
  grunt.config('uglify', {
      options: {
        banner: '<%= banner %>',
        mangle: false
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= jsPath %>/<%= pkg.name %>.min.js'
      } 
   });	
};
