(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var minifyCss = require('gulp-clean-css');
  var rename = require('gulp-rename');

  gulp.task('css-min', ['sass'], function() {
    gulp.src(paths.dest + 'stylesheets/*.css')
      .pipe(minifyCss())
      .pipe(rename({ suffix: '.min' }))
      .pipe(gulp.dest(paths.dest + 'stylesheets/'));
  });
})();
