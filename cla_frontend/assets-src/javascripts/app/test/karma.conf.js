(function () {
  'use strict';

  module.exports = function(config){
    config.set({

      basePath : '../../../../',

      files : [
        'assets/javascripts/lib.min.js',
        'assets/javascripts/cla.main.min.js',
        'assets-src/vendor/angular-mocks/angular-mocks.js',
        'assets-src/javascripts/app/test/unit/**/*.js'
      ],

      autoWatch : true,

      frameworks: ['jasmine'],

      browsers : ['PhantomJS'],

      plugins : [
              'karma-chrome-launcher',
              'karma-firefox-launcher',
              'karma-phantomjs-launcher',
              'karma-jasmine',
              'karma-junit-reporter'
              ],

      reporters: ['progress', 'junit'],

      junitReporter : {
        outputFile: '../reports/karma.xml',
        suite: 'unit'
      }

    });
  };
})();
