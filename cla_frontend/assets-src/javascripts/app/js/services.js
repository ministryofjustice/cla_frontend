'use strict';
(function(){

  var transformData = function($http, data, headers) {
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

      var resource = djResource('/call_centre/proxy/case/:caseref/', {caseref: '@reference'}, {
        'personal_details_patch': {
          method:'PATCH',
          transformRequest: function(data, headers) {
            return transformData($http, {personal_details: data.personal_details}, headers);
          }
        },
        'case_details_patch': {
          method:'PATCH',
          transformRequest: function(data, headers) {
            return transformData($http, {
              notes: data.notes,
              in_scope: data.in_scope
            }, headers);
          }
        }
      });

      resource.prototype.$decline_specialists = function(data, successCallback) {
        var url = '/call_centre/proxy/case/'+this.reference+'/decline_all_specialists/';
        $http.post(url, data).success(successCallback);
      };

      resource.prototype.$defer_assignment = function(data, successCallback) {
        var url = '/call_centre/proxy/case/'+this.reference+'/defer_assignment/';
        $http.post(url, data).success(successCallback);
      };

      resource.prototype.get_suggested_providers = function(){
        return $http.get('/call_centre/proxy/case/'+this.reference+'/assign_suggest/');
      };

      resource.prototype.$assign = function(data){
        var url = '/call_centre/proxy/case/'+this.reference+'/assign/';
        return $http.post(url, data);
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('EligibilityCheck', ['$http', 'djResource', function($http, djResource) {
      return djResource('/call_centre/proxy/eligibility_check/:ref/', {ref:'@reference'}, {
        'patch': {method: 'PATCH'}
      });
    }]);

  angular.module('cla.services')
    .factory('Category', ['$http', 'djResource', function($http, djResource) {
      return djResource('/call_centre/proxy/category/:code/', {
      });
    }]);

  angular.module('cla.services')
    .factory('OutcomeCode', ['$http', 'djResource', function($http, djResource) {
      return djResource('/call_centre/proxy/outcome_code/:code/', {});
    }]);
})();
