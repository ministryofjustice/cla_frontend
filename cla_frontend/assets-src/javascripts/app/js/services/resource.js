(function () {
  'use strict';

  angular.module('cla.services')
    .factory('$claResource', ['$resource', 'postal', function($resource, postal) {
      var claResource = function(modelName, url, paramDefaults, actions, options) {
        var defaultActions = {
            'get': {method: 'GET'},
            'save': {method: 'POST'},
            'query': {method: 'GET', isArray: true},
            'remove': {method: 'DELETE'},
            'delete': {method: 'DELETE'}
          },
          eventAction;
        actions = angular.extend({}, defaultActions, actions);

        angular.forEach(actions, function(action) {
        	eventAction = null;

        	if (/^(POST|PUT|PATCH)$/i.test(action.method)) {
        		eventAction = 'saved';
        	} else if (action.method === 'DELETE') {
        		eventAction = 'deleted';
        	}

        	if (eventAction) {
						action.interceptor = action.interceptor || {};
						if (action.interceptor.response) {
							console.log('TODO: not yet implemented, overriding your interceptor :-/ ...');
						}

						action.interceptor.response = (function(modelName, eventAction) {
							return function(response) {
	            	postal.publish({
							    channel : 'models',
							    topic   : modelName+'.'+eventAction,
							    data    : response.resource
								});

	            	return response.resource;
	          	};
	          })(modelName, eventAction);
        	}
        });

        return $resource(url, paramDefaults, actions, options);
      };

      return claResource;
    }]);
})();
