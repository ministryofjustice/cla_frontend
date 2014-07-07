'use strict';
(function(){

  angular.module('cla.directives')
  .directive('timer', function() {
    return {
      restrict: 'E',
      replace: true,
      template:
      '<p class="UserMenu-status">' +
        '<span class="Timer-total u-pullRight">' +
          '<span class="js-Stopwatch">{{timer.value}}</span>' +
          '<a class="button" ng-click="startTimer()" ng-show="startButton && !timer.running">start</a>' +
        '</span>' +
      '</p>',
      scope: {
        baseTime: '=?',
        startButton: '=?'
      },
      controller: ['$scope', '$rootScope', 'Timer', 'Stopwatch', function($scope, $rootScope, Timer, Stopwatch) {
        $scope.timer = new Stopwatch({
          baseTime: ($scope.baseTime || 0)
        });

        // EVENTS (listeners)

        $rootScope.$on('timer:changed', function(__, time) {
          if ($scope.timer.running) {
            // running so just updating the currentTime to keep it in sync
            $scope.timer.setCurrentTime(time);
          } else {
            // not running so starting with currentTime from db
            $scope.timer.start(time);
          }
        });

        $rootScope.$on('timer:stopped', function() {
          $scope.timer.stop();
        });

        $scope.$on('$destroy', function() {
          $scope.timer.stop();
        });

        $scope.startTimer = function() {
          $rootScope.$emit('timer:start');
        };
      }]
    };


  }).factory('Timer', ['$http', '$rootScope', 'flash', function($http, $rootScope, flash) {
    // API
    var Timer = {
      baseUrl: '/call_centre/proxy/timer/',

      start: function(successCallback, errorCallback) {
        return $http.post(this.baseUrl).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      },

      getCurrent: function(successCallback, errorCallback) {
        return $http.get(this.baseUrl).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      }
    };

    // EVENTS (actions)

    $rootScope.$on('timer:check', function() {
      Timer.getCurrent(function(data) {
        var time = Math.ceil((new Date().getTime() - new Date(data.created).getTime()) / 1000);
        $rootScope.$emit('timer:changed', time);
      }, function() {
        $rootScope.$emit('timer:stopped');
      });
    });

    $rootScope.$on('timer:start', function() {
      Timer.start(function() {
        $rootScope.$emit('timer:changed', 0);
      }, function(data) {
        flash('error', data.detail);
      });
    });

    return Timer;

  }]).factory('Stopwatch', ['$interval', function($interval) {
    var Stopwatch = function (options) {
      _.bindAll(this, '_setTime', 'formatTime');
      this.settings = angular.extend({}, this.defaults, options);

      this.currentTime = this.settings.startTime;
      this.baseTime = this.settings.baseTime;
      this.running = false;
      this._updateValue();
    };

    Stopwatch.prototype = {
      defaults: {
        baseTime: 0,
        startTime: 0,
        separator: ':'
      },

      start: function (startFrom) {
        if (startFrom !== undefined) {
          this.currentTime = startFrom;
        }
        this.timer = $interval(this._setTime, 1000);
        this.running = true;
      },

      stop: function () {
        $interval.cancel(this.timer);

        this.running = false;

        this.currentTime = 0;
        this._updateValue();
      },

      setCurrentTime: function(currentTime) {
        this.currentTime = currentTime;
      },

      _setTime: function () {
        this.currentTime += 1;
        this._updateValue();
      },

      _updateValue: function () {
        this.value = this.formatTime(this.baseTime + this.currentTime);
      },

      formatTime: function (time) {
        var secs = this.pad(time % 60),
            mins = this.pad(parseInt(time / 60) % 60),
            hrs = this.pad(parseInt(time / 3600) % 24);

        return hrs + this.settings.separator + mins + this.settings.separator + secs;
      },

      pad: function (val) {
        return val > 9 ? val : '0' + val;
      }
    };

    return Stopwatch;
  }]);

})();