(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var concat = require('gulp-concat');
  var ngAnnotate = require('gulp-ng-annotate');

  // concat js files
  gulp.task('js-concat', ['ng-constants', 'ng-templates'], function() {
    return gulp
      .src(paths.scripts.app)
      .pipe(concat('cla.main.js'))
      .pipe(ngAnnotate())
      .pipe(gulp.dest(paths.dest + 'javascripts/'));
  });
})();
