var gulp = require('gulp'),
    plugins = require("gulp-load-plugins")(),
    stylish = require('jshint-stylish');

var paths = {
  dest_dir: 'cla_frontend/assets/',
  styles: 'cla_frontend/assets-src/stylesheets/**/*.scss',
  scripts: ['cla_frontend/assets-src/javascripts/cla.main.js'],
  images: 'cla_frontend/assets-src/images/**/*'
};

// compile scss
gulp.task('sass', function() {
  return gulp.src(paths.styles)
              .pipe(plugins.sass({errLogToConsole: true}))
              .pipe(gulp.dest(paths.dest_dir + 'stylesheets'));
});

// concat js
gulp.task('js', function() {
  return gulp.src(paths.scripts)
              .pipe(plugins.concat('cla.main.js'))
              .pipe(gulp.dest(paths.dest_dir + 'javascripts'));
});

// jshint js code
gulp.task('lint', function() {
  return gulp.src(paths.scripts)
              .pipe(plugins.jshint())
              .pipe(plugins.jshint.reporter(stylish));
});

// optimise images
gulp.task('images', function() {
  return gulp.src(paths.images)
              .pipe(plugins.imagemin({optimizationLevel: 5}))
              .pipe(gulp.dest(paths.dest_dir + 'images'));
});

// setup watches
gulp.task('watch', function() {
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.scripts, ['js', 'lint']);
  gulp.watch(paths.images, ['images']);
});

// setup default tasks
gulp.task('default', ['build']);
gulp.task('build', ['sass', 'js', 'lint', 'images']);