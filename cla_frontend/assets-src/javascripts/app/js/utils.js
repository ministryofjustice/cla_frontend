'use strict';
(function(){

  angular.module('cla.utils')
    .factory('_', ['$window', function($window){
      return $window._;
    }
  ]);


  angular.module('cla.utils')
    .factory('form_utils', function(){
    return {
      ctrlFormErrorCallback: function($scope, response) {
        // response can be response or data (if it needs to be overridden)
        var data = (response.status === undefined) ? response : response.data;
        // var data = response.data.personal_details[0];

        $scope.errors = {};
        angular.forEach(data, function(errors, field) {
          $scope.form[field].$setValidity('server', false);
          $scope.errors[field] = errors.join(', ');
        });
      }
    };
  });

})();

