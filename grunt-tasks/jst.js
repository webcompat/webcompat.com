/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(grunt) {
  grunt.config("jst", {
    compile: {
      options: {
        namespace: "wcTmpl",
        prettify: true,
        processContent: function(src) {
          // strip the opening and closing <script> tags...
          // otherwise, the template functions will just inject script elements
          // that won't render.
          src = src.replace(/<script type="text\/template">/, "");
          src = src.replace(/<\/script>/, "");
          return src.trim();
        },
        processName: function(filename) {
          // make this a bit less redunant when we have to refer back
          // to the pre-compiled template function names.
          return filename.split("webcompat/templates/")[1];
        }
      },
      files: {
        "<%= jsPath %>/dist/templates.js": ["<%= tmplPath %>/**/*.jst"]
      }
    }
  });
};
