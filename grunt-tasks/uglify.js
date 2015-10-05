module.exports = function(grunt) {
  grunt.config('uglify', {
      options: {
        banner: '<%= banner %>',
        mangle: false
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= jsPath %>/<%= pkg.name %>.min.js'
      },
      issues: {
        src: '<%= concat.issues.dest %>',
        dest: '<%= jsPath %>/issues.min.js'
      },
      issueList: {
        src: '<%= concat.issueList.dest %>',
        dest: '<%= jsPath %>/issue-list.min.js'
      },
      userActivity: {
        src: '<%= concat.userActivity.dest %>',
        dest: '<%= jsPath %>/user-activity.min.js'
      },
      diagnose: {
        src: '<%= concat.diagnose.dest %>',
        dest: '<%= jsPath %>/diagnose.min.js'
      }
   });
};
