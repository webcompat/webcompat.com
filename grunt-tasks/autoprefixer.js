module.exports = function(grunt) {
  grunt.config('autoprefixer', {
      options: {
        browsers: ['ff >= 4', 'ie >= 8', 'safari >= 5.1', 'opera >= 12', 'chrome >=10']
      },
      no_dest: {
        src: '<%= cssPath %>/webcompat.dev.css',
        dest: '<%= cssPath %>/webcompat.dev.css'
      } 
   });	
};
