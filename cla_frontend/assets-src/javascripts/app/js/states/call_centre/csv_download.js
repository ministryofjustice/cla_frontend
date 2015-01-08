(function () {
  'use strict';

  var mod = angular.module('cla.states.operator');

  mod.config(['AppSettings', function (AppSettings) {
    var states = mod.states || angular.module('cla.states').states;

    states.CsvDownload = {
      name: 'csv_download_list',
      parent: 'layout',
      templateUrl: 'csv_download_list.html',
      controller: 'CSVUploadCtrl',
      url: AppSettings.BASE_URL + 'csvdownload/',
      resolve: {
        csvuploads: ['$stateParams', 'CSVUpload', 'user', '$q',
          function ($stateParams, CSVUpload, user, $q) {
            var deferred = $q.defer();

            if (!user.is_manager) {
              // reject promise and handle in $stateChangeError
              deferred.reject({
                msg: 'The you must be a manager to edit users.'
              });
            }
            return CSVUpload.query().$promise;
          }]
      }
    };

    mod.states = states;
  }]);
})();
