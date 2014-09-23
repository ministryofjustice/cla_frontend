(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var ngConstant = require('gulp-ng-constant');

  // convert django cla_common constants into angular constants
  gulp.task('ng-constants', function () {
    return gulp
      .src(paths.src + 'javascripts/app/constants.json')
      .pipe(ngConstant({
        name: 'cla.constants'
      }))
      // Writes config.js to dist folder
      .pipe(gulp.dest(paths.tmp + 'javascripts/app/js/'));
  });
})();
