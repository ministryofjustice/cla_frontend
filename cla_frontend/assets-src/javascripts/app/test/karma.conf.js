module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      '../../vendor/angular/angular.js',
      '../../vendor/angular-animate/angular-animate.js',
      '../../vendor/angular-resource/angular-resource.js',
      '../../vendor/angular-ui-router/release/angular-ui-router.js',
      '../../vendor/angular-i18n/angular-locale_en-gb.js',
      '../../vendor/angular-mocks/angular-mocks.js',
      'js/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
