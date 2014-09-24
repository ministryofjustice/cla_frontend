/* jshint unused: false */
(function(){
  'use strict';

  var gulp = require('gulp'),
      runSequence = require('run-sequence'),
      requireDir = require('require-dir'),
      dir = requireDir('./tasks/gulp'); // load tasks from ./tasks/gulp/ folder

  // setup default task
  gulp.task('default', ['build']);
  // run build
  gulp.task('build', function () {
    runSequence('clean-pre', 
                ['css-min', 'copy-fonts', 'images', 'copy-vendor-js', 'build-guidance', 'lint', 'js-lib-compile', 'js-app-compile'],
                'clean-post');
  });
})();
