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
          '<a class="button" ng-click="startTimer()" ng-show="!timer.running">start</a>' +
        '</span>' +
      '</p>',

      controller: ['$scope', '$rootScope', 'Timer', 'flash', '$interval', function($scope, $rootScope, Timer, flash, $interval) {
        var Stopwatch = function (options) {
          _.bindAll(this, '_setTime', 'formatTime');
          this.settings = angular.extend({}, this.defaults, options);

          this.currentTime = this.settings.startTime;
          this.running = false;
          this._updateValue();
        };

        Stopwatch.prototype = {
          defaults: {
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

          setCurrentTime: function(currentTimeInSecs) {
            this.currentTime = currentTimeInSecs;
          },

          _setTime: function () {
            this.currentTime += 1;
            this._updateValue();
          },

          _updateValue: function () {
            this.value = this.formatTime(this.currentTime);
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

        $scope.timer = new Stopwatch();


        // NOT SURE ABOUT THIS...

        $scope.startTimer = function() {
          new Timer().start(function() {
            $scope.timer.start();
          }, function(data) {
            flash('error', data.detail);
          });
        };

        $scope.$on('$destroy', function() {
          // Make sure that the interval is destroyed too
          $scope.timer.stop();
        });

        $rootScope.$on('timer:check', function() {
          new Timer().getCurrent(function(data) {
            var startFrom = Math.ceil((new Date().getTime() - new Date(data.created).getTime()) / 1000);

            if ($scope.timer.running) {
              // running so just updating the currentTime to keep it in sync
              $scope.timer.setCurrentTime(startFrom);
            } else {
              // not running so starting with currentTime from db
              $scope.timer.start(startFrom);
            }
          }, function() {
            $scope.timer.stop();
          });
        });
        
      }]
    };
  });

})();