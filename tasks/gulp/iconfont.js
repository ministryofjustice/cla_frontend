(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var iconfont = require('gulp-iconfont');
  var iconfontCss = require('gulp-iconfont-css');
  var consolidate = require('gulp-consolidate');
  var rename = require('gulp-rename');

  // copy across web fonts
  gulp.task('iconfont', ['sass-copy'], function(cb) {
    var fontName = 'cla-icons';

    return gulp.src(paths.icons)
      .pipe(iconfontCss({
        fontName: fontName,
        path: paths.src + 'stylesheets/_icons.scss',
        targetPath: '../stylesheets/_icons.scss',
        fontPath: '../fonts/'
      }))
      .pipe(iconfont({ fontName: fontName }))
      .on('codepoints', function(codepoints) {
        var options = {
          glyphs: codepoints,
          fontName: fontName,
          className: 'Icon'
        };
        // create template containing all fonts
        gulp.src(paths.src + 'fonts/icon-template.html')
          .pipe(consolidate('lodash', options))
          .pipe(rename({ basename: fontName }))
          .pipe(gulp.dest(paths.dest + 'fonts/'));
      })
      .pipe(gulp.dest(paths.tmp + 'fonts/'));
  });
})();
