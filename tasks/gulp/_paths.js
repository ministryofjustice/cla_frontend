(function(){
  'use strict';

  var libPath = 'node_modules/';
  var paths = {
    tmp: '.gulptmp/',
    dest: 'cla_frontend/assets/',
    src: 'cla_frontend/assets-src/',
    icons: [],
    images: [],
    fonts: [],
    styles: [],
    ng_partials: [],
    vendor_static: [],
    scripts: {},
  };

  // styles
  paths.styles.push(paths.src + 'stylesheets/**/*.scss');
  // icons
  paths.icons.push(paths.src + 'fonts/svg-icons/*.svg');
  // fonts
  paths.fonts.push(paths.src + 'fonts/*.{eot,svg,ttf,woff}');
  paths.fonts.push(paths.tmp + 'fonts/*.{eot,svg,ttf,woff}');
  // images
  paths.images.push(paths.src + 'images/**/*');
  // partials
  paths.ng_partials.push(paths.src + 'javascripts/app/partials/**/*.html');
  // vendor scripts
  paths.vendor_static.push(paths.src + 'javascripts/vendor/**/*');
  paths.vendor_static.push(paths.src + 'vendor/fullcalendar/fullcalendar.min.js');
  paths.vendor_static.push(libPath + 'raven-js/dist/angular/raven.js');
  // ignore certain vendor scripts from the copy
  paths.vendor_static.push('!' + paths.src + 'javascripts/vendor/diff-match-patch/');
  paths.vendor_static.push('!' + paths.src + 'javascripts/vendor/diff-match-patch/**');
  paths.vendor_static.push('!' + paths.src + 'javascripts/vendor/ui-bootstrap-custom-tpls-1.3.3.js');
  // scripts
  paths.scripts = {
    vendor: [
      libPath + 'lodash/dist/lodash.js',
      libPath + 'jquery/dist/jquery.js',
      libPath + 'select2/select2.js',
      // angular specific
      paths.src + 'vendor/angular/angular.js',
      paths.src + 'vendor/angular-sanitize/angular-sanitize.js',
      libPath + 'angular-messages/angular-messages.js',
      libPath + 'angular-animate/angular-animate.js',
      libPath + 'angular-sticky-plugin/dist/angular-sticky.js',
      libPath + 'angular-resource/angular-resource.js',
      libPath + '@uirouter/angularjs/release/angular-ui-router.js',
      libPath + 'angular-ui-select2/src/select2.js',
      paths.src + 'vendor/angular-i18n/angular-locale_en-gb.js',
      paths.src + 'vendor/moment/moment.js',
      paths.src + 'vendor/moment-timezone/builds/moment-timezone-with-data-2010-2020.js',
      libPath + 'angular-moment/angular-moment.js',
      paths.src + 'vendor/angular-blocks/dist/angular-blocks.js',
      libPath + 'rome/dist/rome.standalone.js', // datepicker
      paths.src + 'javascripts/vendor/ui-bootstrap-custom-tpls-1.3.3.js',
      libPath + 'angular-xeditable/dist/js/xeditable.js',
      libPath + 'conduitjs/lib/conduit.js',
      libPath + 'postal/lib/postal.js',
      libPath + 'angular-loading-bar/build/loading-bar.js',
      libPath + 'socket.io-client/dist/socket.io.js',
      libPath + 'angular-socket-io/socket.js',
      libPath + 'angulartics/src/angulartics.js',
      libPath + 'angulartics-google-analytics/lib/angulartics-ga.js',
      libPath + 'angular-hotkeys/build/hotkeys.js',
      paths.src + 'vendor/ng-text-truncate/ng-text-truncate.js',
      libPath + 'angular-local-storage/dist/angular-local-storage.js',
      paths.src + 'vendor/angularUtils/src/directives/pagination/dirPagination.js',
      paths.src + 'vendor/ng-idle/angular-idle.js',
      paths.src + 'javascripts/vendor/diff-match-patch/angular-diff-match-patch.js',
      paths.src + 'javascripts/vendor/diff-match-patch/google-diff-match-patch.js',
      paths.src + 'vendor/papaparse/papaparse.js', // csv upload
      paths.src + 'vendor/FileSaver/FileSaver.js' // csv upload
    ],
    app: [
      paths.src + 'javascripts/app/js/app.js',
      paths.tmp + 'javascripts/app/partials/**/*', // dynamically generated by gulp task (ng-templates)
      paths.src + 'javascripts/app/js/**/*.js',
      paths.tmp + 'javascripts/app/js/constants.js', // dynamically generated by gulp task (ng-constants)
      paths.src + 'javascripts/modules/**/*.js'
    ]
  };

  module.exports = paths;
})();
