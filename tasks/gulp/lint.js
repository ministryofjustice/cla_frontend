(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var jshint = require('gulp-jshint');
  var stylish = require('jshint-stylish');
  var filesToLint = paths.scripts.app.concat([
    'tests/**/*.js',
    'gulpfile.js',
    'tasks/gulp/*.js',
    '!' + paths.tmp + 'javascripts/app/partials/**/*'
  ]);

  // lint js code
  gulp.task('lint', function() {
    gulp
      .src(filesToLint)
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
  });
})();
