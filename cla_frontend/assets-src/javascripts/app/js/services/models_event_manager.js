'use strict';
(function(){

  angular.module('cla.services')
    .factory('ModelsEventManager', ['postal', 'Log', function(postal, Log) {
      return function(case_, eligibility_check, diagnosis, log_set) {
        var subscriptions = [],
            configured = false;

        return {
          onEnter: function() {
            var self = this;

            if (configured) {
              throw 'ModelsEventManager already configured!';
            }
            configured = true;

            subscriptions.push(
              postal.subscribe({
                channel  : 'models',
                topic    : 'Diagnosis.saved',
                callback : function(_diagnosis) {
                  // NOTE: always check for object identity (_diagnosis === diagnosis)
                  // otherwise, you might end up updating other case's objects if the destroy
                  // callback doesn't get triggered for any reason
                  if (_diagnosis === diagnosis && _diagnosis.isInScopeTrue() && _diagnosis.category) {
                    // update eligibility check
                    eligibility_check.category = _diagnosis.category;
                    if (eligibility_check.reference) {
                      eligibility_check.$update(case_.reference);
                    }

                    // update case matter types
                    if (_diagnosis.matter_type1 || _diagnosis.matter_type2) {
                      case_.matter_type1 = _diagnosis.matter_type1;
                      case_.matter_type2 = _diagnosis.matter_type2;
                      case_.$set_matter_types();
                    }
                  }
                }
              })
            );

            subscriptions.push(
              postal.subscribe({
                channel  : 'models',
                topic    : 'Log.refresh',
                callback : function() {
                  self.refreshLogs();
                }
              })
            );

            this.refreshLogs();
          },

          onExit: function() {
            angular.forEach(subscriptions, function(subscription) {
              subscription.unsubscribe();
            });
          },

          refreshLogs: function() {
            Log.query({case_reference: case_.reference}).$promise.then(function(data) {
              log_set.data = data;
            });
          }
        };
      };
    }]);

})();
