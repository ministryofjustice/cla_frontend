(function () {
  'use strict';

  var mod = angular.module('cla.states.provider');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.CsvUpload = {
      name: 'csv_upload_list',
      parent: 'layout',
      templateUrl: 'csv_upload_list.html',
      controller: 'CSVUploadCtrl',
      url: AppSettings.BASE_URL + 'csvupload/?page',
      resolve: {
        csvuploads: ['$stateParams', 'CSVUpload',
          function ($stateParams, CSVUpload) {
            var params = {
              page: $stateParams.page
            };
            return CSVUpload.query(params).$promise;
          }
        ]
      }
    };

    mod.states = states;
  }]);
})();
