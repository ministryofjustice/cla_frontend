(function () {
  'use strict';
  angular.module('cla.services')
    .service('AlternativeHelpService', [function() {
      this.clear = function() {
        this.selected_ids = {};
        this.selected_providers = {};
        this.notes = '';
      };

      this.get_selected_provider_ids = function () {
        var selected = [];

        for (var k in this.selected_providers) {
          if (this.selected_providers.hasOwnProperty(k) && this.selected_providers[k]) {
            selected.push(k);
          }
        }
        return selected;
      };

      this.clear();
    }]);
})();

