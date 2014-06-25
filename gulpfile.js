var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  stylish = require('jshint-stylish'),
  runSequence = require('run-sequence');

var paths = {
  build_dir: 'cla_frontend/build/',
  dest_dir: 'cla_frontend/assets/',
  src_dir: 'cla_frontend/assets-src/',
  styles: 'cla_frontend/assets-src/stylesheets/**/*.scss',
  partials: 'cla_frontend/assets-src/javascripts/app/partials/**/*.html',
  scripts: {
    angular: [
      'cla_frontend/assets-src/vendor/angular/angular.js',
      'cla_frontend/assets-src/vendor/angular-sanitize/angular-sanitize.js',
      'cla_frontend/assets-src/vendor/angular-animate/angular-animate.js',
      'cla_frontend/assets-src/vendor/angular-resource/angular-resource.js',
      'cla_frontend/assets-src/vendor/angular-ui-router/release/angular-ui-router.js',
      'cla_frontend/assets-src/vendor/angular-i18n/angular-locale_en-gb.js',
      'cla_frontend/assets-src/javascripts/vendor/xeditable.js',
      'cla_frontend/assets-src/vendor/moment/moment.js',
      'cla_frontend/assets-src/vendor/angular-moment/angular-moment.js',
    ],
    app: [
      'cla_frontend/assets-src/javascripts/app/js/app.js',
      'cla_frontend/assets-src/javascripts/app/js/**/*.js',
    ],
    vendor: [
      'cla_frontend/assets-src/vendor/lodash/dist/lodash.min.js',
      'cla_frontend/assets-src/vendor/jquery-details/jquery.details.js',
      'cla_frontend/assets-src/vendor/handlebars/handlebars.js',
    ],
    vendor_static: [
      'cla_frontend/assets-src/javascripts/vendor/fullcalendar.min.js',
      'cla_frontend/assets-src/javascripts/vendor/modernizr.custom.92045.js',
    ],
    moj: [
      'cla_frontend/assets-src/javascripts/moj.Helpers.js',
      'cla_frontend/assets-src/javascripts/modules/*'
    ],
    misc: [
      'cla_frontend/assets-src/javascripts/misc/*.js'
    ],
    debug: [
      'cla_frontend/assets-src/javascripts/**/*debug*'
    ]
  },
  main_built_scripts: [
    'cla_frontend/build/javascripts/main/**/*.js'
  ],
  images: 'cla_frontend/assets-src/images/**/*'
};

// clean out assets folder
gulp.task('clean-assets', function() {
  return gulp
    .src(paths.dest_dir, {read: false})
    .pipe(plugins.clean());
});

gulp.task('clean-build', function() {
  return gulp
    .src(paths.build_dir, {read: false})
    .pipe(plugins.clean());
});

gulp.task('clean', ['clean-assets', 'clean-build']);

// compile scss
gulp.task('sass-build', function() {
  return gulp
    .src(paths.styles)
    .pipe(plugins.rubySass({
      loadPath: 'node_modules/govuk_frontend_toolkit/' // add node module toolkit path
    }))
    .pipe(gulp.dest(paths.build_dir + 'stylesheets'));
});

gulp.task('sass-release', ['sass-build'], function(){
  return gulp
    .src(paths.build_dir + 'stylesheets/**')
    .pipe(gulp.dest(paths.dest_dir + 'stylesheets/'));
});

gulp.task('js-concat-angular', function(){
  return gulp
    .src(paths.scripts.angular)
    .pipe(plugins.concat('angular.js'))
    .pipe(gulp.dest(paths.build_dir + 'javascripts/main/'));
});

gulp.task('js-concat-ngmin-app', function(){
  return gulp
    .src(paths.scripts.app)
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.ngmin())
    .pipe(gulp.dest(paths.build_dir + 'javascripts/main/'));
});

gulp.task('js-concat-vendor', function(){
  return gulp
    .src(paths.scripts.vendor)
    .pipe(plugins.concat('vendor.js'))
    .pipe(gulp.dest(paths.build_dir + 'javascripts/main/'));
});

gulp.task('js-concat-vendor-static', function(){
  return gulp
    .src(paths.scripts.vendor_static)
    .pipe(plugins.concat('vendor_static.js'))
    .pipe(gulp.dest(paths.build_dir + 'javascripts/main/'));
});

gulp.task('js-concat-moj', function(){
  return gulp
    .src(paths.scripts.moj)
    .pipe(plugins.concat('moj.js'))
    .pipe(gulp.dest(paths.build_dir + 'javascripts/main/'));
});

gulp.task('js-concat-debug', function(){
  return gulp
    .src(paths.scripts.debug)
    .pipe(plugins.concat('cla.debug.js'))
    .pipe(gulp.dest(paths.build_dir + 'javascripts'));
});

gulp.task('js-copy-misc', function(){
  return gulp
    .src(paths.scripts.misc)
    .pipe(gulp.dest(paths.build_dir + 'javascripts/misc/'));
});

gulp.task('js-templates', function(){
  return gulp.src(paths.partials)
    .pipe(plugins.angularTemplates({module: 'cla.templates'}))
    .pipe(gulp.dest(paths.build_dir + 'javascripts/main/templates/'));
});

gulp.task('js-build-main',
  ['js-concat-angular', 'js-concat-ngmin-app', 'js-concat-vendor',
   'js-concat-vendor-static', 'js-concat-moj', 'js-concat-debug',
   'js-copy-misc', 'js-templates']);

gulp.task('js-concat-main', ['js-build-main'], function(){
  var src_path = paths.main_built_scripts;
  src_path.push('!' + paths.build_dir + '**/*debug*');

  return gulp.src(src_path)
    .pipe(plugins.closureCompiler({
      compilerPath: 'node_modules/closurecompiler/compiler/compiler.jar',
      fileName: 'cla.main.js',
      compilerFlags: {
        language_in: 'ECMASCRIPT5',
        warning_level: 'QUIET',
        compilation_level: 'WHITESPACE_ONLY',
      }
    }))
    .pipe(gulp.dest(paths.build_dir + 'javascripts'));
});

gulp.task('js-release-main', ['js-concat-main'], function(){
  return gulp
    .src(paths.build_dir + 'javascripts/cla.main.js')
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/'));
});

gulp.task('js-release-debug', ['js-concat-debug'], function(){
  return gulp
    .src(paths.build_dir + 'javascripts/cla.debug.js')
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/'));
});

gulp.task('js-release-misc', ['js-copy-misc'], function(){
  return gulp
    .src(paths.build_dir + 'javascripts/misc/*')
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/misc/'));
});

gulp.task('js-release',
  ['js-release-main', 'js-release-misc', 'js-release-debug']);

// jshint js code
gulp.task('lint', function() {
  var files = paths.scripts.app.concat(paths.scripts.moj);

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
  gulp.watch(paths.styles, ['sass-release']);
  gulp.watch(paths.src_dir + 'javascripts/**/*', ['lint', 'js-release']);
  gulp.watch(paths.images, ['images']);
});

// setup default tasks
gulp.task('default', ['build']);

gulp.task('build', function(){
  runSequence('clean',
    ['lint', 'js-release', 'sass-release', 'images'])
});
