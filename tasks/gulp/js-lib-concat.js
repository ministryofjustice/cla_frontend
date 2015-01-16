(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var concat = require('gulp-concat');
  var ngAnnotate = require('gulp-ng-annotate');

  // concat js files
  gulp.task('js-lib-concat', function() {
    return gulp
      .src(paths.scripts.vendor)
      .pipe(concat('lib.js'))
      .pipe(ngAnnotate())
      .pipe(gulp.dest(paths.dest + 'javascripts/'));
  });
})();
