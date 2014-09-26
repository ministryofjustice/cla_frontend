(function(){
  'use strict';
  
  var gulp = require('gulp');
  var sass = require('gulp-ruby-sass');
  var paths = require('./_paths');

  gulp.task('sass', ['iconfont'], function() {
    return gulp
      .src(paths.tmp + 'stylesheets/**/*.scss')
      .pipe(sass({
        lineNumbers: true,
        style: 'compact',
        loadPath: 'node_modules/govuk_frontend_toolkit/' // add node module toolkit path
      }))
      .on('error', function (err) { console.log(err.message); })
      .pipe(gulp.dest(paths.dest + 'stylesheets/'));
  });
})();
