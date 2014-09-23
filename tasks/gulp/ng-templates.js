(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var angularTemplates = require('gulp-angular-templates');

  // angular partials
  gulp.task('ng-templates', function(){
    return gulp.src(paths.ng_partials)
      .pipe(angularTemplates({module: 'cla.templates'}))
      .pipe(gulp.dest(paths.tmp + 'javascripts/app/partials/'));
  });
})();
