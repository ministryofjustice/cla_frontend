var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  gulp.src(['./cla_frontend/assets/stylesheets/*.scss'])
      .pipe(sass({includePaths: ['./cla_frontend/assets/stylesheets'], errLogToConsole: true}))
      .pipe(gulp.dest('./cla_frontend/static/stylesheets'));
});


gulp.task('default', ['build']);
gulp.task('build', ['sass']);