module.exports = function(grunt) {
  grunt.config('cssnext', {
    options: {
      sourcemap: true,
      features:{
        autoprefixer: {
          browsers: ['ff >= 4', 'ie >= 8', 'safari >= 5.1', 'opera >= 12', 'chrome >=10']
        },
        import: {
          path: ["node_modules"]
        }
      }
    },
      dist: {
        files: {
          '<%= cssPath %>/webcompat.dev.css': '<%= cssPath %>/development/main.css'
        }
      }
   });
};
