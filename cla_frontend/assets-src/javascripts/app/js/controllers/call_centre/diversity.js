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
            script: '<p>The first category is gender. Which of the following describes how you think of yourself?</p>',
            name: 'gender',
            options: GENDERS
          },
          {
            title: 'Ethnic origin',
            script: '<p>Secondly, what is your ethnicity?</p><p><em>If a client has trouble answering this question, ask "<strong>Can you tell me which of these options best describes your ethnicity?</strong>" and then read out all the options. If the client does not wish to say, select "<strong>Prefer not to say</strong>". If the client\'s ethnicity is not on the list, select "<strong>Other</strong>".</em></p>',
            name: 'ethnicity',
            options: ETHNICITIES
          },
          {
            title: 'Disabilities',
            name: 'disability',
            script: '<p>Do you consider yourself to be disabled?</p><p><em>If the client answers "<strong>No</strong>", select "<strong>Not considered disabled</strong>".</em></p><p><em>If the client answers "<strong>Yes</strong>", ask: "<strong>How would you describe your disability?</strong>" (If a client has trouble answering this question, ask "<strong>Can you tell me which of these options best describes your disability?</strong>" and then read out all the options. If the client does not wish to say, select "<strong>Prefer not to say</strong>". If the client\'s disability is not on the list, select "<strong>Other</strong>".)</em></p>',
            options: DISABILITIES
          },
          {
            title: 'Religion / belief',
            name: 'religion',
            script: '<p>What is your religion or belief?</p><p><em>If a client has trouble answering this question, ask "<strong>Can you tell me which of these options best describes your religion or belief?</strong>" and then read out all the options. If the client does not wish to say, select "<strong>Prefer not to say</strong>". If the client\'s religion or belief is not on the list, select "<strong>Other</strong>".</em></p>',
            options: RELIGIONS
          },
          {
            title: 'Sexual orientation',
            name: 'sexual_orientation',
            script: '<p>What is your sexual orientation?</p><p><em>(If a client does not understand this question, please give them examples of some of the answers to direct the client. You do not need to read out the whole list but it may be appropriate to prompt the client by saying "<strong>For example, Heterosexual or Bisexual?</strong>" If the client does not wish to say, please select "Prefer not to say". If the client states a sexual orientation which is not on the list, please select "Other".)</em></p>',
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
