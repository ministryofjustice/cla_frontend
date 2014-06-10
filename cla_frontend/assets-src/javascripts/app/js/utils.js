'use strict';
(function(){
  angular.module('cla.utils')
    .factory('_', ['$window', function($window){
    return $window._;
  }]);
})();

