(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('DiversityCtrl', ['$scope', 'GENDERS', 'ETHNICITIES', 'RELIGIONS', 'SEXUAL_ORIENTATIONS',
      function($scope, GENDERS, ETHNICITIES, RELIGIONS, SEXUAL_ORIENTATIONS) {
        $scope.current = {
          step: 1,
          answer: undefined
        };
        $scope.sections = [
          {
            title: 'Gender',
            name: 'gender',
            options: GENDERS
          }, {
            title: 'Ethnic origin',
            name: 'ethnicity',
            options: ETHNICITIES
          }, {
            title: 'Religion / belief',
            name: 'religion',
            options: RELIGIONS
          }, {
            title: 'Sexual orientation',
            name: 'orientation',
            options: SEXUAL_ORIENTATIONS
          }
        ];

        $scope.getDisplayLabel = function(val, list) {
          var item = _.findWhere(list, {value: val});

          if (item) {
            return item.text;
          }
        };

        $scope.gotoStep = function (step) {
          $scope.submitted = false;

          if ($scope.sections[step-1] !== undefined && $scope.sections[step-1].hasOwnProperty('answer')) {
            $scope.current.answer = $scope.sections[step-1].answer;
          } else {
            $scope.current.answer = null;
          }

          $scope.current.step = step;
        };

        $scope.nextStep = function (valid) {
          if ($scope.current.step < $scope.sections.length+1 && valid) {
            $scope.sections[$scope.current.step-1].answer = $scope.current.answer;
            $scope.gotoStep($scope.current.step+1);
          } else {
            $scope.submitted = true;
          }
        };

        $scope.previousStep = function () {
          if ($scope.current.step > 1) {
            $scope.gotoStep($scope.current.step-1);
          }
        };

        $scope.save = function (valid) {
          $scope.nextStep(valid);


        };
      }
    ]);
})();
