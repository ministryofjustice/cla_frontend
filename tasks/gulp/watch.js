(function(){
  'use strict';

  var gulp = require('gulp');
  var paths = require('./_paths');

  gulp.task('watch', function() {
    var lr = require('gulp-livereload');
    lr.listen();

    gulp.watch(paths.fonts, ['copy-fonts']);
    gulp.watch(paths.styles.concat(paths.icons), ['sass']);
    gulp.watch(paths.images, ['images']);
    gulp.watch(paths.vendor_static, ['copy-vendor-js']);
    gulp.watch(paths.src + 'javascripts/**/*', ['lint', 'js-concat']);
    gulp.watch('tests/**/*.js', ['lint']);
    // watch built files and send reload event
    gulp.watch(paths.dest + '**/*').on('change', lr.changed);
  });
})();
