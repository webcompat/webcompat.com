/*global module:false*/
module.exports = function(grunt) {

     //Check if package.json exists
     if (!grunt.file.exists('package.json')) {
       grunt.log.error("Json file is missing!")
       process.exit(1)
     }
	// Initialize config.
  	grunt.initConfig({
    	pkg: require('./package.json')
	});	

  grunt.initConfig({
    pkg: require('./package.json'),
    jsPath: 'webcompat/static/js',
    cssPath: 'webcompat/static/css',
    banner: '/*! <%= pkg.title %>\n' +
      ' *  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      ' *\n' +
      ' *  This code is licensed under the MPL 2.0 License, except where\n' +
      ' *  otherwise stated. See http://mozilla.org/MPL/2.0/. */\n'
  });
  // Load per-task config from separate files.
  grunt.loadTasks('grunt-tasks');
		
  //Import all module
  require('load-grunt-tasks')(grunt)
  
  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify','myth', 'autoprefixer','cmq', 'cssmin']);
  grunt.registerTask('css', ['myth', 'autoprefixer']);
};
