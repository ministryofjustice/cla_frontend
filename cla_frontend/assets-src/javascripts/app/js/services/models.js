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

      var resource = $resource(
        '/call_centre/proxy/case/:caseref/',
        {caseref: '@reference'},
        {
          'query':  {
            method:'GET',
            isArray:false,
            transformResponse: function(data) {
              var _data = angular.fromJson(data),
                  results = [];

              angular.forEach(_data.results, function (item) {
                // jshint -W055
                results.push(new resource(item));
                // jshint +W055
              });

              _data.results = results;
              return _data;
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
        }
      );

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

      resource.prototype.$associate_adaptation_details = function(reference, successCallback) {
        var data = {reference: reference},
            url = '/call_centre/proxy/case/'+this.reference+'/associate_adaptation_details/';
        return $http.post(url, data).success(successCallback);
      };

      resource.prototype.$associate_thirdparty_details = function(reference, successCallback) {
        var data = {reference: reference},
            url = '/call_centre/proxy/case/'+this.reference+'/associate_thirdparty_details/';
        return $http.post(url, data).success(successCallback);
      };

      resource.prototype.get_suggested_providers = function(){
        return $http.get('/call_centre/proxy/case/'+this.reference+'/assign_suggest/');
      };

      resource.prototype.$assign = function(data){
        var url = '/call_centre/proxy/case/'+this.reference+'/assign/';
        return $http.post(url, data);
      };

      resource.prototype.$assign = function(data){
        var url = '/call_centre/proxy/case/'+this.reference+'/assign/';
        return $http.post(url, data);
      };

      resource.prototype.isInScopeAndEligible = function(){
        return this.in_scope && this.eligibility_state === 'yes';
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('EligibilityCheck', ['$http', '$resource', function($http, $resource) {
      var that = this, resource;

      this.BASE_URL = '/call_centre/proxy/case/:case_reference/eligibility_check/';

      resource = $resource(this.BASE_URL, {case_reference: '@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
        }
      };

      resource.prototype.validate = function(case_reference) {
        return $http.get(that.BASE_URL
          .replace(':case_reference', case_reference)+'validate/');
      };

      resource.prototype.isEligibilityTrue = function() {
        return this.state === 'yes';
      };
      resource.prototype.isEligibilityFalse = function() {
        return this.state === 'no';
      };
      resource.prototype.isEligibilityUnknown = function() {
        return (this.state === undefined || this.state === 'unknown');
      };
      return resource;
    }]);

  angular.module('cla.services')
    .factory('PersonalDetails', ['$resource', function($resource) {
      var resource = $resource('/call_centre/proxy/case/:case_reference/personal_details/', {case_reference:'@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
        }
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('AdaptationsMetadata', ['$resource', function ($resource) {
      var resource = $resource('/call_centre/proxy/adaptations/', {}, {
        'options': {method: 'OPTIONS'}
      });

      return resource;
    }]);

  angular.module('cla.services')
    .factory('Adaptations', ['$resource', function($resource) {
      var resource = $resource('/call_centre/proxy/case/:case_reference/adaptation_details/', {case_reference:'@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference},success, fail);
        }
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('ThirdParty', ['$resource', function($resource) {
      var resource = $resource('/call_centre/proxy/case/:case_reference/thirdparty_details/', {case_reference:'@case_reference'}, {
        'patch': {method: 'PATCH'}
      });

      resource.prototype.$update = function(case_reference, success, fail){
        if (this.reference) {
          return this.$patch({case_reference: case_reference}, success, fail);
        } else {
          return this.$save({case_reference: case_reference}, success, fail);
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
    .factory('Event', ['$http', function($http) {
      var defaults = {
        baseUrl: '/call_centre/proxy/event/'
      };

      function Event(options) {
        if (options === undefined) {
          options = {};
        }

        for (var i in defaults) {
          if (options[i] === undefined) {
            options[i] = defaults[i];
          }
        }

        this.options = options;

        return this;
      }

      Event.prototype.list_by_event_key = function(event_key, successCallback) {
        var url = this.options.baseUrl + event_key + '/';
        return $http.get(url).success(successCallback || angular.noop);
      };

      return Event;
    }]);

  angular.module('cla.services')
    .factory('Provider', ['$http', '$resource', function($http, $resource) {
      return $resource('/call_centre/proxy/provider/:id/', {
      });
    }]);
})();
