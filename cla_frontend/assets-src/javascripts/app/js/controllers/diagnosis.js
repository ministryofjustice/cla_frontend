(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('DiagnosisCtrl',
      ['$scope', 'Category', 'postal', 'eligibility_check',
        function($scope, Category, postal, eligibility_check) {
          // updates the state of case.diagnosis_state after each save
          function saveCallback(data) {
            $scope.case.diagnosis_state = data.state;

            if (!$scope.diagnosis.isInScopeUnknown()) {
              // refreshing the logs
              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
            }
          }

          // creates a new diagnosis
          $scope.createDiagnosis = function () {
            if (!$scope.case.diagnosis) {
              // creates the diagnosis object if it doesn't exist
              $scope.diagnosis.$save({
                'case_reference': $scope.case.reference
              }, function(data) {
                $scope.case.diagnosis = data.reference;
              });
            }
          };

          $scope.moveDown = function() {
            $scope.diagnosis.$move_down({
              'case_reference': $scope.case.reference
            }, saveCallback);

            // Mutation observer used to detect when form element has been changed
            // Due to new question (elements) being added and old question (elements) being removed
            var form = document.querySelector('form[name="diagnosis-form"]')

            // Element is placed 100px under the form buttons using CSS
            // To ensure user doesn't have to scroll to find the button
            var anchorScroll = document.getElementById('anchor-scroll');

            var config = {
              childList: true
            };

            var callback = function(mutationsList, observer) {
              observer.disconnect();
              anchorScroll.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
              return;
            };

            var observer = new MutationObserver(callback);

            observer.observe(form, config);
          };

          $scope.moveUp = function() {
            $scope.diagnosis.$move_up({
              'case_reference': $scope.case.reference
            }, saveCallback);
          };

          $scope.delete = function() {
            $scope.diagnosis.$delete({'case_reference': $scope.case.reference}, function() {
              $scope.case.diagnosis = null;
              eligibility_check.has_passported_proceedings_letter = false
              eligibility_check.$update($scope.case.reference)

              // refreshing the logs
              postal.publish({
                channel : 'models',
                topic   : 'Log.refresh'
              });
            });

            // Scroll to the top of the screen in case button is hidden from previous scrolling
            scrollTo(0,0);
          };

          // if choices.length === 1 => check it by default
          $scope.$watch('diagnosis.choices', function(newVal) {
            if (newVal && newVal.length === 1) {
              $scope.diagnosis.current_node_id = newVal[0].id;
            }
          });

          $scope.$watch('diagnosis.category', function(newVal) {
            if (!newVal) {
              $scope.category = null;
            } else {
              Category.get({code: $scope.diagnosis.category}).$promise.then(function(data) {
                $scope.category = data;
              });
            }
          });
        }
      ]
    );
})();
