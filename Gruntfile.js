module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsPath: 'webcompat/static/js',
    cssPath: 'webcompat/static/css',
    imgPath: 'webcompat/static/img',
    banner: '/*! <%= pkg.title %>\n' +
      ' *  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      ' *\n' +
      ' *  This code is licensed under the MPL 2.0 License, except where\n' +
      ' *  otherwise stated. See http://mozilla.org/MPL/2.0/. */\n'
  });

  // Load per-task config from separate files.
  grunt.loadTasks('grunt-tasks');

  // load all grunt tasks
  require('load-grunt-tasks')(grunt)

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify','cssnext','cmq', 'cssmin', 'imagemin']);
};
