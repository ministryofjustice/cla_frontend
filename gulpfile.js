var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    requireDir = require('require-dir'),
    dir = requireDir('./tasks/gulp'); // load tasks from ./tasks/gulp/ folder

// setup default task
gulp.task('default', ['build']);
// run build
gulp.task('build', function() {
  runSequence('clean-pre', ['css-min', 'fonts', 'images', 'vendor', 'guidance-build', 'lint', 'js-lib-compile', 'js-app-compile']);
});
