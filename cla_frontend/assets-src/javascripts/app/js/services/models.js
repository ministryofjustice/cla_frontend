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
    .factory('Case', ['$http', '$resource', function($http, $resource) {

      var resource = $resource('/call_centre/proxy/case/:caseref/', {caseref: '@reference'}, {
        'query':  {method:'GET', isArray:false},
        'personal_details_patch': {
          method:'PATCH',
          transformRequest: function(data, headers) {
            return transformData($http, {personal_details: data.personal_details}, headers);
          }
          // ,
          // transformResponse: function() {
          //   return null;
          // }
        },
        'case_details_patch': {
          method:'PATCH',
          transformRequest: function(data, headers) {
            return transformData($http, {
              notes: data.notes,
              in_scope: data.in_scope
            }, headers);
          }
          // ,
          // transformResponse: function() {
          //   return null;
          // }
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

      resource.prototype.$associate_personal_details = function(reference, successCallback) {
        var data = {reference: reference},
            url = '/call_centre/proxy/case/'+this.reference+'/associate_personal_details/';
        return $http.post(url, data).success(successCallback);
      };

      resource.prototype.$associate_eligibility_check = function(reference, successCallback) {
        var data = {reference: reference},
            url = '/call_centre/proxy/case/'+this.reference+'/associate_eligibility_check/';
        return $http.post(url, data).success(successCallback);
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
    .factory('EligibilityCheck', ['$http', '$resource', function($http, $resource) {
      var that = this, resource;

      this.BASE_URL = '/call_centre/proxy/eligibility_check/';

      resource = $resource(this.BASE_URL + ':ref/', {ref: '@reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(success, fail){
        if (this.reference) {
          return this.$patch(success, fail);
        } else {
          return this.$save(success, fail);
        }
      };

      resource.prototype.validate = function() {
        return $http.get(that.BASE_URL+this.reference+'/validate/');
      };

      resource.prototype.isEligibilityTrue = function() {
        return this.state === 'yes';
      };
      resource.prototype.isEligibilityFalse = function() {
        return this.state === 'no';
      };
      resource.prototype.isEligibilityUnknown = function() {
        return (this.state === undefined || this.state === 'maybe');
      };
      return resource;
    }]);

  angular.module('cla.services')
    .factory('PersonalDetails', ['$resource', function($resource) {
      var resource = $resource('/call_centre/proxy/personal_details/:ref/', {ref:'@reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(success, fail){
        if (this.reference) {
          return this.$patch(success, fail);
        } else {
          return this.$save(success, fail);
        }
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('Category', ['$http', '$resource', function($http, $resource) {
      return $resource('/call_centre/proxy/category/:code/', {
      });
    }]);

  angular.module('cla.services')
    .factory('OutcomeCode', ['$http', '$resource', function($http, $resource) {
      return $resource('/call_centre/proxy/outcome_code/:code/', {});
    }]);

  angular.module('cla.services')
    .factory('Provider', ['$http', '$resource', function($http, $resource) {
      return $resource('/call_centre/proxy/provider/:id/', {
      });
    }]);
})();
