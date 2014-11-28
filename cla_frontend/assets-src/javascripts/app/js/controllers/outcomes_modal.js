(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('OutcomesModalCtl',
      ['$scope', 'case', 'event_key', 'Event', 'notes', 'tplVars',
        function($scope, _case, event_key, Event, notes, tplVars) {
          // template vars
          tplVars = angular.extend({
            'title': 'Outcome code'
          }, tplVars);
          tplVars.buttonText = tplVars.buttonText || tplVars.title;
          $scope.tplVars = tplVars;

          // action
          new Event().list_by_event_key(event_key, function(data) {
            $scope.codes = data;
          });

          $scope.notes = notes || '';

          $scope.cancel = function () {
            $scope.$dismiss('cancel');
          };

          $scope.post_submit = function() {
            $scope.$close(true);
          };

          $scope.submit_outcome = function (event_code, notes) {
            return _case['$'+event_key]({
              'event_code': event_code,
              'notes': notes || ''
            });
          };

          $scope.submit = function() {
            $scope.submit_outcome(this.event_code, this.notes)
              .then($scope.post_submit, function(response) {
                $scope.errors = {};
                angular.forEach(response.data, function(errors, field) {
                  $scope.errors[field] = errors.join(', ');
                });
              });
          };

        }
      ]
    )
    .controller('ImplicitOutcomeModalCtl',
      ['$scope', 'case', 'model_action', 'Event', 'notes', 'tplVars',
        function($scope, _case, model_action, Event, notes, tplVars) {
          // template vars
          tplVars = angular.extend({
            'title': 'Outcome code'
          }, tplVars);
          tplVars.buttonText = tplVars.buttonText || tplVars.title;
          $scope.tplVars = tplVars;

          $scope.notes = notes || '';

          $scope.cancel = function () {
            $scope.$dismiss('cancel');
          };

          $scope.post_submit = function(obj) {
            $scope.$close(obj);
          };

          $scope.submit_outcome = function (notes) {
            return _case['$'+model_action]({
              'notes': notes || ''
            });
          };

          $scope.submit = function() {
            $scope.submit_outcome(this.notes)
              .then($scope.post_submit, function(response) {
                $scope.errors = {};
                angular.forEach(response.data, function(errors, field) {
                  $scope.errors[field] = errors.join(', ');
                });
              });
          };

        }
      ]
    );
})();
