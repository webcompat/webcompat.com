/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsPath: 'webcompat/static/js',
    cssPath: 'webcompat/static/css',
    banner: '/*! <%= pkg.title %>\n' +
      ' *  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
      ' *\n' +
      ' *  This code is licensed under the MPL 2.0 License, except where\n' +
      ' *  otherwise stated. See http://mozilla.org/MPL/2.0/. */\n',
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: false
      },
      dist: {
        src: [
            '<%= jsPath %>/vendor/jquery-1.11.0.min.js',
            '<%= jsPath %>/lib/homepage.js',
            '<%= jsPath %>/lib/bugform.js'
        ],
        dest: '<%= jsPath %>/<%= pkg.name %>.js'
      }
    },
    cssmin: {
      options: {
        banner: '<%= banner %>'
      },
      combine: {
        files: {
          // output
          '<%= cssPath %>/webcompat.min.css': [
            // input
            '<%= cssPath %>/main.css'
          ]
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: false
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= jsPath %>/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          $: true,
          Ember: true,
          App: true
        }
      },
      beforeconcat: [
        'Gruntfile.js',
        '<%= jsPath %>/lib/homepage.js',
        '<%= jsPath %>/lib/bugform.js',
        '<%= jsPath %>/lib/app.js'
      ]
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.beforeconcat %>',
        tasks: ['jshint:beforeconcat']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'cssmin']);

};
