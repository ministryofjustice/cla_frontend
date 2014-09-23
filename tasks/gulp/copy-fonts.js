(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');

  // copy fonts
  gulp.task('fonts', ['iconfont'], function(cb) {
    gulp.src(paths.fonts)
      .pipe(gulp.dest(paths.dest + 'fonts/'));
  });
})();
