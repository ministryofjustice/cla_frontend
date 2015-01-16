(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');

  gulp.task('js-app-compile', ['js-concat'], function(){
    return gulp.src(paths.dest + 'javascripts/cla.main.js')
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.dest + 'javascripts/'));
  });
})();
