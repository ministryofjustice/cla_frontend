(function() {
  'use strict';

  angular.module('cla.directives')
    .directive('notesHistory', ['$modal', 'postal', function($modal, postal) {
      return {
        restrict: 'A',
        scope: {
          type: '@historyType'
        },
        link: function (scope, elem, attrs) {
          elem.on('click', function() {
            postal.publish({
              channel: 'NotesHistory',
              topic: 'view',
              data: {
                label: scope.type
              }
            });

            scope.caseRef = attrs.notesHistory;
            scope.summary = attrs.summary || true;

            var onModalClose = function () {
              elem.focus();
            };

            $modal.open({
              templateUrl: 'notes.history.modal.html',
              scope: scope,
              controller: 'NotesHistoryModalCtl'
            }).result.then(onModalClose, onModalClose);
          });
        }
      };
    }]);

  angular.module('cla.controllers')
    .controller('NotesHistoryModalCtl',
      ['$scope', '$modalInstance', 'NotesHistory', 'dmp',
        function($scope, $modalInstance, NotesHistory, dmp) {

          function getPages () {
            NotesHistory.query(
              {
                case_reference: $scope.caseRef,
                type: $scope.type,
                page: $scope.currentPage,
                with_extra: true,
                summary: $scope.summary
              }
            ).$promise.then(function(data) {
                var el,
                  prevNotes = {};

                $scope.notes = data;

                for (var i=$scope.notes.results.length-1; i>=0; i-=1) {
                  el = $scope.notes.results[i];
                  el.diffHTML = dmp.createSemanticDiffHtml(prevNotes.type_notes || ' ', el.type_notes || ' ');
                  prevNotes = el;
                }

                if (data.next !== null) {
                  $scope.notes.results.pop();
                }
              });
          }

          $scope.updatePage = function(page) {
            $scope.currentPage = page;
            getPages();
          };

          $scope.close = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.toggleSummary = function() {
            $scope.summary = !$scope.summary;
            $scope.currentPage = 1;
            getPages();
          };

          $scope.currentPage = 1;

          getPages();
        }
      ]
    );
}());
