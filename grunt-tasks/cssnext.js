module.exports = function(grunt) {
  grunt.config('cssnext', {
     options:{
        sourcemap: true,
        browsers: ['ff >= 4', 'ie >= 8', 'safari >= 5.1', 'opera >= 12', 'chrome >=10']
      },
      dist: {
        files: {
          '<%= cssPath %>/webcompat.dev.css': '<%= cssPath %>/development/main.css'
        }
      }
   });
};
