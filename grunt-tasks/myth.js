module.exports = function(grunt) {
  grunt.config('myth', {
     options:{
        sourcemap: true
      },
      dist: {
        files: {
          '<%= cssPath %>/webcompat.dev.css': '<%= cssPath %>/development/main.css'
        }
      }
   });
};
