(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CSVUploadCtrl',
    ['$scope', '$state', '$stateParams', 'providers', 'csvuploads', 'CSVUpload', 'moment', 'flash', 'Papa', 'saveAs',
      function($scope, $state, $stateParams, providers, csvuploads, CSVUpload, Moment, flash, Papa, saveAs) {

        function updatePage() {
          $state.go($state.current.name, {
            page: $scope.currentPage,
            provider: $scope.provider
          }, {
            reload: true
          });
        }

        function downloadCSV(csv) {
          var blob = new Blob([Papa.unparse(csv.body)], {type: 'text/csv'});
          var filename = ''+csv.provider+'_'+csv.month+'.csv';
          saveAs(blob, filename);
        }

        function monthRange(start, end) {
          var range = [];
          for (var i = start.clone(); i < end; i= i.clone().add(1, 'months') ) {
            range.push({name: i.format('MMM YYYY'), value: i.format('YYYY-MM-DD')});
          }
          return range;
        }

        function handleError(err) {

          if (err.status === 409) {
            flash('error', err.data.detail);
            return;
          }
          if (err.status === 400 && err.data && err.data.body) {
            $scope.errors = err.data.body;
          } else {
            $scope.errors = err.data;
          }
        }

        $scope.currentPage = $stateParams.page || 1;

        $scope.pageChanged = function(newPage) {
          $scope.currentPage = newPage;
          updatePage();
        };

        $scope.uploads = csvuploads;
        var firstOfThisMonth = new Moment().local().startOf('month');
        var twelveMonthsAgo = firstOfThisMonth.clone().subtract(12, 'months');

        $scope.validMonths = monthRange(twelveMonthsAgo, firstOfThisMonth);

        $scope.submit = function () {
          var upload = new CSVUpload({
            comment: '',
            body: $scope.csvFile,
            month: $scope.month
          });
          upload.$post().then(function () {
            $scope.csvFile = null;
            updatePage();
          }, handleError);
        };

        $scope.provider = ($stateParams.provider && parseInt($stateParams.provider, 10)) || null;
        var providerIDSet = [];
        $scope.providers = providers.filter(function(provider) {
          if(providerIDSet.indexOf(provider.id) === -1) {
            providerIDSet.push(provider.id);
            return true;
          }
          return false;
        });

        $scope.submitFilters = function() {
          $scope.pageChanged(1);
        };

        $scope.download = function(csv) {
          csv.$get().then(downloadCSV, handleError);
        };

        $scope.overwrite = function(newCsv, oldCsv) {
          oldCsv.body = newCsv;
          oldCsv.$put().then(updatePage, handleError);
        };
      }
    ]
  );
})();
