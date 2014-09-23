(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var jshint = require('gulp-jshint');
  var stylish = require('jshint-stylish');

  // jshint js code
  gulp.task('lint', function() {
    var lint = paths.scripts.app
                    .concat([
                      paths.src + 'javascripts/app/test/**/*.js',
                      '!' + paths.tmp + 'javascripts/app/partials/**/*'
                    ]);

    gulp
      .src(lint)
      .pipe(jshint())
      .pipe(jshint.reporter(stylish));
  });
})();
