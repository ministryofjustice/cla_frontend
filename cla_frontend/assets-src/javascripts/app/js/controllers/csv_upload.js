(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CSVUploadCtrl',
    ['$scope', '$state', 'csvuploads', 'CSVUpload', 'moment', 'flash', 'Papa', 'saveAs',
      function($scope, $state, csvuploads, CSVUpload, Moment, flash, Papa, saveAs) {

        function updatePage() {
          $state.go($state.current, {}, {reload: true});
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
          }, function (err) {
            if (err.status === 409) {
              flash('error', err.data.detail);
            }
          });
        };

        $scope.download = function(csv) {
          csv.$get().then(downloadCSV);
        };

        $scope.overwrite = function(newCsv, oldCsv) {
          oldCsv.body = newCsv;
          oldCsv.$put().then(updatePage);
        };
      }
    ]
  );
})();
