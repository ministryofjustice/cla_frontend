(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var ngAnnotate = require('gulp-ng-annotate');
  var closureCompiler = require('gulp-closure-compiler');
  var path = require('path');

  process.env.PATH = path.resolve('node_modules/closurecompiler/jre/bin') + ':' + process.env.PATH;

  gulp.task('js-lib-compile', function(){
    return gulp
      .src(paths.scripts.vendor)
      .pipe(ngAnnotate())
      .pipe(closureCompiler({
        compilerPath: 'node_modules/closurecompiler/compiler/compiler.jar',
        fileName: 'lib.min.js',
        compilerFlags: {
          language_in: 'ECMASCRIPT5',
          warning_level: 'QUIET',
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
        }
      }))
      .pipe(gulp.dest(paths.dest + 'javascripts/'));
  });
})();
