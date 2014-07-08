module.exports = function(grunt) {
  grunt.config('cssmin', {
      options: {
        banner: '<%= banner %>'
      },
      combine: {
        files: {
          // output
          '<%= cssPath %>/webcompat.min.css': [
            // input
            '<%= cssPath %>/webcompat.dev.css'
          ]
        }
      }
   });	
};
