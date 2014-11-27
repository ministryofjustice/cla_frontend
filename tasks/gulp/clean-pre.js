(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var ignore = require('gulp-ignore');
  var rimraf = require('gulp-rimraf');

  // clean out assets folder
  gulp.task('clean-pre', function() {
    return gulp
      .src([paths.dest, paths.tmp, 'reports/protractor-e2e/screenshots/'], {read: false})
      .pipe(ignore('node_modules/**'))
      .pipe(rimraf());
  });
})();
