(function () {
  'use strict';

  module.exports = function(config){
    config.set({

      basePath : '../../',

      files : [
        'cla_frontend/assets-src/vendor/raven-js/dist/angular/raven.js',
        'cla_frontend/assets/javascripts/lib.min.js',
        'cla_frontend/assets/javascripts/cla.main.min.js',
        'cla_frontend/assets-src/vendor/angular-mocks/angular-mocks.js',
        'tests/angular-js/unit/**/*.js'
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
