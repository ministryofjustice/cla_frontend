(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');

  // static vendor files
  gulp.task('vendor', function() {
    gulp
      .src(paths.vendor_static)
      .pipe(gulp.dest(paths.dest + 'javascripts/vendor/'));
  });
})();
