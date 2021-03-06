(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var imagemin = require('gulp-imagemin');

  // optimise images
  gulp.task('images', function() {
    gulp
      .src(paths.images)
      .pipe(imagemin({optimizationLevel: 5}))
      .pipe(gulp.dest(paths.dest + 'images'));
  });
})();
