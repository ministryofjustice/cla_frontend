(function() {
  'use strict';

  angular.module('cla.controllers.operator')
    .controller('DiversityCtrl', ['$scope', 'Diversity', 'GENDERS', 'ETHNICITIES', 'DISABILITIES', 'RELIGIONS', 'SEXUAL_ORIENTATIONS',
      function($scope, Diversity, GENDERS, ETHNICITIES, DISABILITIES, RELIGIONS, SEXUAL_ORIENTATIONS) {
        $scope.current = {
          step: 1,
          answer: undefined
        };
        $scope.sections = [
          {
            title: 'Gender',
            name: 'gender',
            options: GENDERS
          },
          {
            title: 'Ethnic origin',
            name: 'ethnicity',
            options: ETHNICITIES
          },
          {
            title: 'Disabilities',
            name: 'disability',
            options: DISABILITIES
          },
          {
            title: 'Religion / belief',
            name: 'religion',
            options: RELIGIONS
          },
          {
            title: 'Sexual orientation',
            name: 'sexual_orientation',
            options: SEXUAL_ORIENTATIONS
          }
        ];

        var prepareData = function () {
          var data = {};
          for (var i=0; i<$scope.sections.length; i+=1) {
            var section = $scope.sections[i];
            data[section.name] = section.answer;
          }
          return data;
        };

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
          if (valid) {
            $scope.nextStep(valid);

            var data = prepareData();
            data.case_reference = $scope.case.reference;

            var diversity = new Diversity(data);
            diversity.$save(function () {
              $scope.personal_details.has_diversity = true;
            });
          } else {
            $scope.submitted = true;
          }
        };
      }
    ]);
})();
