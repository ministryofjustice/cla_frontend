(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');

  gulp.task('js-lib-compile', ['js-lib-concat'], function(){
    return gulp
      .src(paths.dest + 'javascripts/lib.js')
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.dest + 'javascripts/'));
  });
})();
