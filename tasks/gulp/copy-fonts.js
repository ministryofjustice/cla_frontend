(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');

  // copy fonts
  gulp.task('copy-fonts', ['iconfont'], function() {
    gulp.src(paths.fonts)
      .pipe(gulp.dest(paths.dest + 'fonts/'));
  });
})();
