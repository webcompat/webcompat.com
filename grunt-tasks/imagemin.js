module.exports = function(grunt) {
  grunt.config('imagemin', {
    png: {
      options: {
        optimizationLevel: 7
      },
      files: [{
        expand: true,
        cwd:    '<%= imgPath %>/',
        src:    ['*.png'],
        dest:   '<%= imgPath %>/'
      }]
    },
    jpg: {
      options: {
        progressive: true
      },
      files: [{
        expand: true,
        cwd:    '<%= imgPath %>/',
        src:    ['*.jpg'],
        dest:   '<%= imgPath %>/'
        }]
      }
  });
};
