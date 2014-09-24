(function(){
  'use strict';
  
  var gulp = require('gulp');
  var paths = require('./_paths');
  var closureCompiler = require('gulp-closure-compiler');
  var path = require('path');

  process.env.PATH = path.resolve('node_modules/closurecompiler/jre/bin') + ':' + process.env.PATH;

  gulp.task('js-app-compile', ['js-concat'], function(){
    return gulp.src(paths.dest + 'javascripts/cla.main.js')
          .pipe(closureCompiler({
            compilerPath: 'node_modules/closurecompiler/compiler/compiler.jar',
            fileName: 'cla.main.min.js',
            compilerFlags: {
              language_in: 'ECMASCRIPT5',
              warning_level: 'QUIET',
              compilation_level: 'SIMPLE_OPTIMIZATIONS',
            }
          }))
          .pipe(gulp.dest(paths.dest + 'javascripts/'));
  });
})();
