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
            '<%= jsPath %>/vendor/underscore-min.js',
            '<%= jsPath %>/vendor/backbone-min.js',
            '<%= jsPath %>/lib/homepage.js',
            '<%= jsPath %>/vendor/moment-min.js',
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
            '<%= cssPath %>/webcompat.dev.css'
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
          _: true,
          Backbone: true,
          console: true,
          issueNumber: true,
          moment: true
        }
      },
      beforeconcat: [
        'Gruntfile.js',
        '<%= jsPath %>/lib/homepage.js',
        '<%= jsPath %>/lib/bugform.js',
        '<%= jsPath %>/lib/issues.js'
      ]
    },
    watch: {
      css:{
        files: '<%= cssPath %>/*.css',
        tasks: ['css']
      },
      script:{
        files: '<%= jshint.beforeconcat %>',
        tasks: ['jshint:beforeconcat']
      }
    },
    autoprefixer: {
      options: {
        browsers: ['ff >= 4', 'ie >= 8', 'safari >= 5.1', 'opera >= 12', 'chrome >=10']
      },
      no_dest: {
        src: '<%= cssPath %>/webcompat.dev.css',
        dest: '<%= cssPath %>/webcompat.dev.css'
      }
    },
    myth: {
      options:{
        sourcemap: true
      },
      dist: {
        files: {
          '<%= cssPath %>/webcompat.dev.css': '<%= cssPath %>/main.css'
        }
      }
    },
    cmq: {
      options: {
        log: true
      },
      your_target: {
        files: {
          '<%= cssPath %>' : ['<%= cssPath %>/webcompat.dev.css']
        }
    }
   }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-myth');
  grunt.loadNpmTasks('grunt-combine-media-queries');
  // Default task.
  grunt.registerTask('default', ['jshint', 'concat', 'uglify','myth', 'autoprefixer','cmq', 'cssmin']);
  grunt.registerTask('css', ['myth', 'autoprefixer']);
};
