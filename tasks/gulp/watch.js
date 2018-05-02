'use strict';

var gulp = require('gulp');
var paths = require('./_paths');
var browserSync = require('browser-sync');
var argv = require('yargs').argv;


// Proxy existing server via brower-sync and serve on localhost:3000
gulp.task('watch', ['build'], function() {
  var host = argv.host || argv.h || 'localhost';
  var port = argv.port || argv.p || 8001;

  browserSync({
    proxy: host + ':' + port,
    open: false,
    port: 8888
  });

  gulp.watch(paths.fonts, ['copy-fonts']);
  gulp.watch(paths.styles.concat(paths.icons), ['sass']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.vendor_static, ['copy-vendor-js']);
  gulp.watch(paths.src + 'javascripts/**/*', ['lint', 'js-concat']);
  gulp.watch('tests/**/*.js', ['lint']);
  // watch built files and send reload event
  gulp.watch(paths.dest + '**/*', browserSync.reload);

});
