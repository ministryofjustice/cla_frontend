(function(){
  'use strict';

  var gulp = require('gulp');
  var sass = require('gulp-ruby-sass');
  var paths = require('./_paths');

  gulp.task('sass', ['iconfont'], function() {
    return sass(paths.tmp + 'stylesheets/**/*.scss', {
        sourcemap: true,
        lineNumbers: true,
        style: 'compact',
        loadPath: 'node_modules/govuk_frontend_toolkit/' // add node module toolkit path
      })
      .on('error', sass.logError )
      .pipe(gulp.dest(paths.dest + 'stylesheets/'));
  });
})();
