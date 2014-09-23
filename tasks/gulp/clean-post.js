(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var ignore = require('gulp-ignore');
  var rimraf = require('gulp-rimraf');

  gulp.task('clean-post', function() {
    return gulp
      .src(paths.tmp, {read: false})
      .pipe(ignore('node_modules/**'))
      .pipe(rimraf());
  });
})();
