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
      url: AppSettings.BASE_URL + 'csvdownload/?provider?page',
      resolve: {
        providers: ['Provider', function(Provider) {
          return Provider.query({}).$promise;
        }],
        csvuploads: ['$stateParams', 'CSVUpload', 'user', '$q',
          function ($stateParams, CSVUpload, user, $q) {
            var deferred = $q.defer();

            if (!user.is_manager) {
              // reject promise and handle in $stateChangeError
              deferred.reject({
                msg: 'You must be a manager to download these files.'
              });
            }

            var params = {
              page: $stateParams.page,
              provider_id: $stateParams.provider
            };
            return CSVUpload.query(params).$promise;
          }]
      }
    };

    mod.states = states;
  }]);
})();
