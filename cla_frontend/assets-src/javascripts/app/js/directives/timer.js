'use strict';
(function(){

  angular.module('cla.directives')
  .directive('timer', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/timer.html',
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


  }).factory('Timer', ['$http', function($http) {
    // API
    var Timer = {
      baseUrl: '/call_centre/proxy/timer/',

      getOrCreate: function(successCallback, errorCallback) {
        return $http.post(this.baseUrl).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      },

      get: function(successCallback, errorCallback) {
        return $http.get(this.baseUrl).
          success(successCallback || angular.noop).
          error(errorCallback || angular.noop);
      }
    };
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

  }]).run(['$rootScope', 'Timer', 'flash', '$window', function($rootScope, Timer, flash, $window) {
    /*
      This deals with 2 types of events:

      ACTION EVENTS:
        Emit this if you want a backend check/action. You should never listen to this events
        from anywhere else apart from here.

        * 'timer:start': gets or creates a timer from the backend
        * 'timer:check': checks if a timer is running asking the backend

      APPLICATION EVENTS:
        Emitted by this module every time the state of the timer changes. You should never emit
        these events but only listen to them.

        * 'timer:changed': with 'time' as param. Used to notify listeners that the timer has
          changed
        * 'timer:stopped': used to notify listeners that the timer has stopped. Please note that
          this doesn't check if the timer is running so it might be emitted even when the timer
          is not running.
    */

    var LOCAL_STORAGE_KEY = 'cla:timer',
        onTimerChangedAPICallback = function(dateCreated) {
          var time = Math.ceil((new Date().getTime() - new Date(dateCreated).getTime()) / 1000);
          localStorage.setItem(LOCAL_STORAGE_KEY, time);
          emitTimerChanged(time);
        },
        onTimerStoppedAPICallback = function() {
          localStorage.setItem(LOCAL_STORAGE_KEY, null);
          emitTimerStopped();
        },
        emitTimerChanged = function(time) {
          $rootScope.$emit('timer:changed', time);
          $rootScope.timerRunning = true;
        },
        emitTimerStopped = function() {
          $rootScope.$emit('timer:stopped');
          $rootScope.timerRunning = false;
        };


    $rootScope.timerRunning = false;

    // ACTION EVENTS
    // emitting timer:check and timer:start triggers this module
    // to call the backend and check if the timer is running or not

    $rootScope.$on('timer:check', function() {
      Timer.get(function(data) {
        onTimerChangedAPICallback(data.created);
      }, function() {
        onTimerStoppedAPICallback();
      });
    });

    $rootScope.$on('timer:start', function(__, options) {
      options = options || {};

      Timer.getOrCreate(function(data) {
        onTimerChangedAPICallback(data.created);
        (options.success || angular.noop)();
      }, function(data) {
        flash('error', data.detail);
        (options.error || angular.noop)();
      });
    });

    // listener which starts/stops timer if the timer has been stopped
    // or started in another window/tab

    $window.addEventListener('storage', function(event) {
      if (event.key === LOCAL_STORAGE_KEY) {
        var time = parseInt(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (isNaN(time)) {
          emitTimerStopped();
        } else {
          emitTimerChanged(time);
        }
      }
    });

  }]);

})();