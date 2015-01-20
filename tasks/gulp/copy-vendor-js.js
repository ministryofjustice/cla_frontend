(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');
  var uglify = require('gulp-uglify');

  // static vendor files
  gulp.task('copy-vendor-js', function() {
    gulp
      .src(paths.vendor_static)
      .pipe(uglify({
        preserveComments: 'all'
      }))
      .pipe(gulp.dest(paths.dest + 'javascripts/vendor/'));
  });
})();
