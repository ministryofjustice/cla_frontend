'use strict';
(function(){

  var transformData = function(data, headers, fns) {
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
    .factory('Case', ['$http', '$claResource', 'DIAGNOSIS_SCOPE', 'ELIGIBILITY_STATES', 'REQUIRES_ACTION_BY', 'url_utils', 'moment',
      function($http, $claResource, DIAGNOSIS_SCOPE, ELIGIBILITY_STATES, REQUIRES_ACTION_BY, url_utils, Moment) {

      var resource = $claResource('Case',
        url_utils.proxy('case/:caseref/'),
        {caseref: '@reference'},
        {
          'get':    {method:'GET', ignoreExceptions: [404]},
          'query':  {
            method:'GET',
            isArray:false,
            transformResponse: function(data, headers) {
              var _data = transformData(
                    data, headers, $http.defaults.transformResponse
                  ),
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
          'patch': {
            method: 'PATCH',
          },
          'case_details_patch': {
            method:'PATCH',
            transformRequest: function(data, headers) {
              return transformData({
                notes: data.notes,
                provider_notes: data.provider_notes
              }, headers, $http.defaults.transformRequest);
            }
          },
          'set_matter_types': {
            method:'PATCH',
            transformRequest: function (data, headers) {
              return transformData({
                matter_type1: data.matter_type1,
                matter_type2: data.matter_type2
              }, headers, $http.defaults.transformRequest);
            }
          },
          'set_media_code': {
            method:'PATCH',
            transformRequest: function(data, headers) {
              return transformData({
                media_code: data.media_code
              }, headers, $http.defaults.transformRequest);
            }
          },
          'accept_case': {
            method:'POST',
            url: url_utils.proxy('case/:caseref/accept/')
          }
        }
      );

      resource.prototype.$defer_assignment = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/defer_assignment/');
        return $http.post(url, data);
      };

      resource.prototype.get_suggested_providers = function(as_of){
        var url = '/call_centre/proxy/case/'+this.reference+'/assign_suggest/',
          as_of_datetime;
        if (as_of) {
          as_of_datetime = new Moment(as_of);
          if (as_of_datetime.isValid()) {
            url += '?' + $.param({'as_of': as_of_datetime.format()});
          }
        }

        return $http.get(url);
      };

      resource.prototype.$assign = function(data){
        var url = url_utils.proxy('case/'+this.reference+'/assign/');
        return $http.post(url, data);
      };

      resource.prototype.isInScopeAndEligible = function(){
        return this.diagnosis_state === DIAGNOSIS_SCOPE.INSCOPE && this.eligibility_state === ELIGIBILITY_STATES.YES;
      };

      resource.prototype.$suspend_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/suspend/');
        return $http.post(url, data);
      };

      resource.prototype.$decline_help = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/decline_help/');
        return $http.post(url, data);
      };

      resource.prototype.$assign_alternative_help = function (data) {
        var url = url_utils.proxy('case/'+this.reference+'/assign_alternative_help/');
        return $http.post(url, data);
      };

      // Provider only endpoints
      resource.prototype.isRequiresActionByProviderPreview = function(){
        return this.requires_action_by === REQUIRES_ACTION_BY.PROVIDER_REVIEW;
      };

      resource.prototype.$reject_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/reject/');
        return $http.post(url, data);
      };

      resource.prototype.$close_case = function(data) {
        var url = url_utils.proxy('case/'+this.reference+'/close/');
        return $http.post(url, data);
      };

      resource.prototype.$search_for_personal_details = function(person_q) {
        var url = url_utils.proxy('case/'+this.reference+'/search_for_personal_details/?person_q='+person_q);
        return $http.get(url);
      };

      resource.prototype.$link_personal_details = function(personal_details) {
        var url = url_utils.proxy('case/'+this.reference+'/link_personal_details/');
        return $http.post(url, {
          personal_details: personal_details
        });
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('EligibilityCheck', ['$http', '$claResource', 'url_utils', function($http, $claResource, url_utils) {
      var that = this, resource;

      this.BASE_URL = url_utils.proxy('case/:case_reference/eligibility_check/');

      resource = $claResource('EligibilityCheck', this.BASE_URL, {case_reference: '@case_reference'}, {
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
    .factory('Diagnosis', ['$http', '$claResource', 'DIAGNOSIS_SCOPE', 'url_utils', function($http, $claResource, DIAGNOSIS_SCOPE, url_utils) {
      var resource;

      this.BASE_URL = url_utils.proxy('case/:case_reference/diagnosis/');

      resource = $claResource('Diagnosis', this.BASE_URL, {case_reference: '@case_reference'}, {
          // 'patch': {method: 'PATCH'},
          'delete': {method: 'DELETE',
            transformResponse: function() {
              return {};
            },
          },
          'move_down': {
            method:'POST',
            url: this.BASE_URL + 'move_down/'
          },
          'move_up': {
            method:'POST',
            url: this.BASE_URL + 'move_up/'
          },
        }
      );

      resource.prototype.isInScopeTrue = function() {
        return this.state === DIAGNOSIS_SCOPE.INSCOPE;
      };
      resource.prototype.isInScopeFalse = function() {
        return this.state === DIAGNOSIS_SCOPE.OUTOFSCOPE;
      };
      resource.prototype.isInScopeUnknown = function() {
        return (this.state === undefined || this.state === DIAGNOSIS_SCOPE.UNKNOWN);
      };

      return resource;
    }]);

  angular.module('cla.services')
    .factory('PersonalDetails', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/personal_details/'), {case_reference:'@case_reference'}, {
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
    .factory('AdaptationsMetadata', ['$resource', 'url_utils', function ($resource, url_utils) {
      var resource = $resource(url_utils.proxy('adaptations/'), {}, {
        'options': {method: 'OPTIONS'}
      });

      return resource;
    }]);

  angular.module('cla.services')
    .factory('Adaptations', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/adaptation_details/'), {case_reference:'@case_reference'}, {
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
    .factory('ThirdParty', ['$resource', 'url_utils', function($resource, url_utils) {
      var resource = $resource(url_utils.proxy('case/:case_reference/thirdparty_details/'), {case_reference:'@case_reference'}, {
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
    .factory('Category', ['$http', '$resource', 'url_utils',
      function($http, $resource, url_utils) {
        return $resource(url_utils.proxy('category/:code/'), null, {
          query: {
            method: 'GET',
            cache: true,
            isArray: true
          }
        });
      }]);

  angular.module('cla.services')
    .factory('Log', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('case/:case_reference/logs/'), {case_reference: '@case_reference'});
    }]);

  angular.module('cla.services')
    .factory('Event', ['$http', 'url_utils', function($http, url_utils) {
      var defaults = {
        baseUrl: url_utils.proxy('event/')
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
    .factory('Provider', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('provider/:id/'), {
      });
    }]);

  angular.module('cla.services')
    .factory('KnowledgeBase', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('knowledgebase/article/:articleref'), {articleref: '@reference'}, {
        get: {
          method: 'GET',
          isArray: false
        }
      });
    }]);

  angular.module('cla.services')
    .factory('KnowledgeBaseCategories', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('knowledgebase/category/'), {}, {
        get: {
          method: 'GET',
          isArray: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('MatterType', ['$http', '$resource', 'url_utils', function($http, $resource, url_utils) {
      return $resource(url_utils.proxy('mattertype/'), {}, {
        get: {
          method: 'GET',
          isArray: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('MediaCode', ['$resource', 'url_utils', function ($resource, url_utils) {
      return $resource(url_utils.proxy('mediacode/'), {}, {
        get: {
          method: 'GET',
          isArray: true
        }
      });
    }]);

  angular.module('cla.services')
    .factory('User', ['$resource', 'url_utils', function ($resource, url_utils) {
      return $resource(url_utils.proxy('user/me/'), {}, {
        get: {
          method: 'GET',
          isArray: false
        }
      });
    }]);

  angular.module('cla.services.operator')
    .factory('Feedback', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('feedback/:reference/'), {'reference': '@reference'}, {
        'patch': {method: 'PATCH'}
      });
    }]);

  angular.module('cla.services.provider')
    .factory('Feedback', ['$resource', 'url_utils', function($resource, url_utils) {
      return $resource(url_utils.proxy('case/:case/feedback/:reference/'), {
        'reference': '@reference',
        'case': '@case'
      }, {
        'patch': {method: 'PATCH'}
      });
    }]);

})();
