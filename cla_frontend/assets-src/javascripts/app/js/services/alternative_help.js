(function () {
  'use strict';
  angular.module('cla.services')
    .service('AlternativeHelpService', [function() {
      var that = this;

      this.clear = function(){
        that.selected_providers = {};
        this.notes = '';
      };

      this.get_selected_provider_ids = function () {
        var selected = [],
          k = null;

        for (k in that.selected_providers) {
          if (that.selected_providers.hasOwnProperty(k) &&
            that.selected_providers[k]) {
            selected.push(k);
          }
        }
        return selected;
      };

      this.clear();
    }]);
})();

