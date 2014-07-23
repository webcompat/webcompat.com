module.exports = function(grunt) {
  grunt.config('cmq', {
      options: {
        log: true
      },
      your_target: {
        files: {
          '<%= cssPath %>' : ['<%= cssPath %>/webcompat.dev.css']
        }
      }
   });
};
