var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  stylish = require('jshint-stylish'),
  runSequence = require('run-sequence'),
  angularTemplates = require('gulp-angular-templates');

var paths = {
  dest_dir: 'cla_frontend/assets/',
  templates_tmp_dest_dir: 'cla_frontend/templates-tmp/',
  src_dir: 'cla_frontend/assets-src/',
  styles: 'cla_frontend/assets-src/stylesheets/**/*.scss',
  partials: 'cla_frontend/assets-src/javascripts/app/partials/**/*.html',
  scripts: [
    // vendor scripts
    'cla_frontend/assets-src/vendor/lodash/dist/lodash.min.js',
    'cla_frontend/assets-src/vendor/jquery-details/jquery.details.js',
    'cla_frontend/assets-src/vendor/handlebars/handlebars.js',
    // angular deps
    'cla_frontend/assets-src/vendor/angular/angular.js',
    'cla_frontend/assets-src/vendor/angular-sanitize/angular-sanitize.js',
    'cla_frontend/assets-src/vendor/angular-animate/angular-animate.js',
    'cla_frontend/assets-src/vendor/angular-resource/angular-resource.js',
    'cla_frontend/assets-src/vendor/angular-ui-router/release/angular-ui-router.js',
    'cla_frontend/assets-src/vendor/angular-i18n/angular-locale_en-gb.js',
    'cla_frontend/assets-src/vendor/moment/moment.js',
    'cla_frontend/assets-src/vendor/angular-moment/angular-moment.js',
    // angular app code
    'cla_frontend/assets-src/javascripts/app/js/app.js',
    'cla_frontend/assets-src/javascripts/app/js/**/*.js',
    // compiled angular templates
    'cla_frontend/templates-tmp/**',
    // CLA
    'cla_frontend/assets-src/javascripts/moj.Helpers.js',
    'cla_frontend/assets-src/javascripts/modules/*'
  ],
  scripts_misc: [
    'cla_frontend/assets-src/javascripts/misc/*.js'
  ],
  vendor_scripts: 'cla_frontend/assets-src/javascripts/vendor/*',
  images: 'cla_frontend/assets-src/images/**/*'
};

// clean out assets folder
gulp.task('clean', function() {
  return gulp
    .src(paths.dest_dir, {read: false})
    .pipe(plugins.clean());
});

// compile scss
gulp.task('sass', function() {
  gulp
    .src(paths.styles)
    .pipe(plugins.rubySass({
      loadPath: 'node_modules/govuk_frontend_toolkit/' // add node module toolkit path
    }))
    .pipe(gulp.dest(paths.dest_dir + 'stylesheets'));
});

// js templates
gulp.task('templates', function(){
  return gulp.src(paths.partials)
    .pipe(angularTemplates({module: 'cla.templates'}))
    .pipe(gulp.dest(paths.templates_tmp_dest_dir));
});

gulp.task('js-concat', ['templates'], function(){
  var prod = paths.scripts.slice(0);
  console.log(prod);

  // ignore debug files
  prod.push('!' + paths.src_dir + '**/*debug*');
  // create concatinated js file
  return gulp
    .src(prod.concat(paths.templates_tmp_dest_dir))
    .pipe(plugins.concat('cla.main.js'))
    .pipe(gulp.dest(paths.dest_dir + 'javascripts'));
});

gulp.task('js-vendor', function(){
  // copy static vendor files
  return gulp
    .src(paths.vendor_scripts)
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/vendor'));
});

gulp.task('js-debug', function(){
  // create debug js file
  return gulp
    .src(paths.src_dir + 'javascripts/**/*debug*')
    .pipe(plugins.concat('cla.debug.js'))
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/'));
});

gulp.task('js-standalone', function(){
  // copy standalone scripts
  return gulp
    .src(paths.scripts_misc)
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/misc'));
});

// default js task
gulp.task('js', ['js-concat', 'js-vendor', 'js-debug', 'js-standalone']);

// remove tmp templates dir
gulp.task('clean_tmp_templates', ['js'], function(){
  return gulp
    .src(paths.templates_tmp_dest_dir, {read: false})
    .pipe(plugins.clean({force: true}));
});

// jshint js code
gulp.task('lint', function() {
  var files = paths.scripts.slice(0);

  // files to ignore from linting
  files.push('!cla_frontend/assets-src/vendor/**');
  files.push('!cla_frontend/assets-src/javascripts/vendor/**');
  files.push('!cla_frontend/assets-src/javascripts/app/templates/**');
  files.push('!' + paths.templates_tmp_dest_dir + '/**');

  gulp
    .src(files)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});

// optimise images
gulp.task('images', function() {
  gulp
    .src(paths.images)
    .pipe(plugins.imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.dest_dir + 'images'));
});

// setup watches
gulp.task('watch', function() {
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.src_dir + 'javascripts/**/*', ['lint', 'js']);
  gulp.watch(paths.images, ['images']);
});

// setup default tasks
gulp.task('default', ['build']);

// run build
gulp.task('build', function() {
  runSequence('clean',
    ['lint', 'templates', 'js', 'images', 'sass', 'clean_tmp_templates']);
});
