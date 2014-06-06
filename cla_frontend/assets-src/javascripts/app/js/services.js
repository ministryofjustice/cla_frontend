'use strict';
(function(){

  var transformData = function(data, headers) {
    var fns = $http.defaults.transformRequest;

    if (angular.isFunction(fns)) {
      return fns(data, headers);
    }

    angular.forEach(fns, function(fn) {
      data = fn(data, headers);
    });

    return data;
  };


// SERVICES
  angular.module('cla.services')
    .factory('Case', ['$http', 'djResource', function($http, djResource) {

      return djResource('/call_centre/proxy/case/:caseref/', {caseref: '@reference'}, {
        'personal_details_patch': {
          method:'PATCH',
          transformRequest: function(data, headers) {
            return transformData({personal_details: data.personal_details}, headers);
          }
        },
        'case_details_patch': {
          method:'PATCH',
          transformRequest: function(data, headers) {
            return transformData({notes: data.notes}, headers);
          }
        }
      });
    }]);

  angular.module('cla.services')
    .factory('EligibilityCheck', ['$http', 'djResource', function($http, djResource) {
      return djResource('/call_centre/proxy/eligibility_check/:ref/', {ref:'@reference'}, {
      });
    }]);

  angular.module('cla.services')
    .factory('Category', ['$http', 'djResource', function($http, djResource) {
      return djResource('/call_centre/proxy/category/:code/', {
      });
    }])
})();