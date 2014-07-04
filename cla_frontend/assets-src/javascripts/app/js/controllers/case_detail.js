(function(){
  'use strict';

  angular.module('cla.controllers')
    .controller('CaseDetailCtrl',
      ['$rootScope', '$scope', 'case', 'eligibility_check', 'personal_details',
        function($rootScope, $scope, $case, $eligibility_check, $personal_details){
          $scope.case = $case;
          $scope.eligibility_check = $eligibility_check;
          $scope.personal_details = $personal_details;

          $rootScope.$emit('timer:check');
        }
      ]
    );
})();