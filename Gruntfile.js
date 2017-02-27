/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    jsPath: "webcompat/static/js",
    cssPath: "webcompat/static/css",
    imgPath: "webcompat/static/img",
    banner: "/*! <%= pkg.title %>\n" +
      " *  Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>\n" +
      " *\n" +
      " *  This code is licensed under the MPL 2.0 License, except where\n" +
      " *  otherwise stated. See http://mozilla.org/MPL/2.0/. */\n"
  });

  // Load per-task config from separate files.
  grunt.loadTasks("grunt-tasks");

  // load all grunt tasks
  require("load-grunt-tasks")(grunt);

  // Default task.
  grunt.registerTask("default", [
    "checkDependencies", "concat", "uglify","postcss", "cssmin"
  ]);

  // Task used before doing a deploy (same as default, but does image optimization)
  grunt.registerTask("deploy", [
    "checkDependencies", "concat", "uglify","postcss", "cssmin", "imagemin"
  ]);
};
