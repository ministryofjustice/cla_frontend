/* jshint unused: false */
(function(){
  'use strict';

  var gulp = require('gulp'),
      runSequence = require('run-sequence'),
      requireDir = require('require-dir'),
      browserSync = require('browser-sync').create(),
      dir = requireDir('./tasks/gulp'); // load tasks from ./tasks/gulp/ folder

  // setup default task
  gulp.task('default', ['build']);
  // run build
  gulp.task('build', function () {
    runSequence('clean-pre',
      ['copy-fonts', 'images', 'copy-vendor-js', 'lint', 'js-lib-compile', 'js-app-compile', 'css-min'],
      'clean-post');
  });

  gulp.task('browser-sync',['build'], function() {
    browserSync.init({
      proxy: "localhost:8001"
    });
  });
})();
