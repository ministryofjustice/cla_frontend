/* global rome */
(function() {
  'use strict';

  var mod = angular.module('cla.directives');


  mod.directive('callbackModal', ['AppSettings', 'moment', 'postal', '$timeout', 'ClaPostalService', 'hotkeys', 'flash', 'form_utils', '$state', function (AppSettings, moment, postal, $timeout, ClaPostalService, hotkeys, flash, form_utils, $state) {
    var timeRounding = 30 * 60 * 1000; // to nearest 30 mins
    var startBuffer = 120; // in mins

    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'directives/callbackModal.html',
      scope: {},
      controller: function ($scope, $element) {
        if (!AppSettings.callMeBackEnabled) {
          $element.remove();
        }

        var minStart = moment().add(startBuffer, 'minutes');
        var start = moment(Math.ceil((+minStart) / timeRounding) * timeRounding);
        $scope.setCurrentDateTime = function(dt) {
          var mdt = moment(dt);
          $scope.currentDateTime = mdt;
          $scope.endTimeValue = mdt.add(30, 'minutes').format('HH:mm');
        };

        $scope.setCurrentDateTime(start);

        // datepicker conf has to be set before template and other directive loads
        $scope.datePickerConf = {
          timeValidator: function (d) {
            var m = moment(d);
            var day = m.clone().day();
            var start = m.clone().hour(8).minute(59).second(59);
            var end = m.clone().hour(19).minute(30).second(1);
            var satEnd = m.clone().hour(12).minute(0).second(1);

            if (day === 0) { // sunday
              return false;
            }
            if (day === 6) { // saturday
              return m.isAfter(start) && m.isBefore(satEnd);
            }
            return m.isAfter(start) && m.isBefore(end);
          },
          dateValidator: function (d) {
            var m = moment(d);
            var today = moment();
            var day = m.clone().day();
            var start = m.clone().hour(8).minute(59).second(59);
            var end = day === 6 ? m.clone().hour(12).minute(0).second(1) : m.clone().hour(19).minute(30).second(1);

            if (day === 0) { // sunday
              return false;
            }
            if (m.isSame(today, 'day')) { // if today
              return m.isAfter(start) && m.isBefore(end);
            }
            return true;
          },
          initialValue: start,
          min: minStart
        };
      },
      link: function (scope, elm) {
        var calendar = rome.find(angular.element('[datetime-picker]', elm)[0]);
        var target;
        scope.isVisible = false;

        var bookSub = postal.subscribe({
          channel: 'CallBack',
          topic: 'toggle',
          callback: function (data) {
            if (data._case) {
              var show = true;

              setCase(data._case);

              if (scope.isVisible) {
                show = false;
              }

              // if a targer has been passed, store it
              if (data.target) {
                target = data.target;
              }

              toggleModal(show);
            } else {
              console.warn('You must pass a case object to a callback modal');
            }
          }
        });

        scope.$on('$destroy', function handleDestroyEvent () {
          bookSub.unsubscribe();
        });

        calendar.on('data', function (value) {
          var m = moment(formatUkDateTime(value));
          var firstSlot = m.hour(9).minutes(0);
          var today = moment();

          if (!m.isSame(scope.currentDateTime, 'day')) {
            if (m.isSame(today, 'day')) {
              scope.setToday();
            } else {
              calendar.setValue(firstSlot);
            }
          }

          scope.setCurrentDateTime(calendar.getDate());

          postal.publish({ channel: 'CallBack', topic: 'set.date' });
        });

        var formatUkDateTime = function(str) {
          var date = str.split(' ')[0];
          var time = str.split(' ')[1];
          var datePieces = date.split('/');
          var timePieces = time.split(':');
          return new Date(datePieces[2], datePieces[1] - 1, datePieces[0], timePieces[0], timePieces[1]);
        };

        var toggleModal = function (toggle) {
          scope.isVisible = toggle;

          // bind/unbind click listener to show/hide results
          if (toggle) {
            angular.element('body').on('click.callbackDelegate', function (e) {
              var $target = angular.element(e.target);

              if (
                !$target.hasClass('CallbackModal') &&
                !$target.hasClass('rd-day-prev-month') &&
                !$target.hasClass('rd-day-next-month') &&
                angular.element(e.target).parents('.CallbackModal').length < 1
              ) {
                toggleModal(false);
              }
            });

            // keyboard shortcut to close modal
            hotkeys
              .bindTo(scope)
              .add({
                combo: 'esc',
                description: 'Close callback overlay',
                callback: function(e, hotkey) {
                  ClaPostalService.publishHotKey(hotkey);
                  toggleModal(false);
                }
              });

            $timeout(function() {
              elm.find('button').first().focus();
            });

            postal.publish({ channel: 'CallBack', topic: 'open' });
          } else {
            angular.element('body').off('click.callbackDelegate');
            hotkeys.del('esc');

            if (target) {
              $timeout(function() {
                target.focus();
              });
            }

            postal.publish({ channel: 'CallBack', topic: 'close' });
          }
        };

        var setCase = function (_case) {
          scope.case = _case;
          scope.canBeCalledBack = _case.canBeCalledBack();
          scope.createdByWeb = _case.createdByWeb();
          scope.isFinalCallBack = _case.isFinalCallback();

          if (scope.canBeCalledBack) {
            if (_case.isFinalCallback()) {
              scope.callbackTitle = 'Schedule final callback';
            } else if (_case.getCallbackDatetime()) {
              scope.callbackTitle = 'Schedule a new callback';
            } else {
              scope.callbackTitle = 'Schedule a callback';
            }
          } else {
            scope.callbackTitle = 'Cancel callback';
          }
        };

        scope.setToday = function () {
          var minTime = moment().add(startBuffer, 'minutes');
          var today = moment(Math.ceil((+minTime) / timeRounding) * timeRounding);
          calendar.setValue(today);
          postal.publish({ channel: 'CallBack', topic: 'set.today' });
        };

        scope.setTomorrow = function () {
          var m = moment().add(1, 'days');
          var firstSlotTomorrow;

          if (m.day() === 0) { // sunday
            m.add(1, 'days');
          }

          firstSlotTomorrow = m.hour(9).minute(0);
          calendar.setValue(firstSlotTomorrow);
          postal.publish({ channel: 'CallBack', topic: 'set.tomorrow' });
        };

        scope.bookCallback = function (form) {
          scope.case.$call_me_back({
            'datetime': (function () {
              var local = moment.tz(calendar.getDate(), 'Europe/London');
              return local.tz('UTC').format('DD/MM/YYYY HH:mm');
            })(),
            'notes': scope.callbackNotes || '',
            'priority_callback': !!scope.priorityCallback
          }).then(function() {
            flash('success', 'Callback scheduled successfully.');
            $state.go('case_list');
          }, function(data) {
            form_utils.ctrlFormErrorCallback(scope, data, form);
          });
        };

        scope.cancelCallback = function() {
          scope.case.$cancel_call_me_back().then(function() {
            flash('success', 'Callback cancelled successfully.');
            $state.go('case_list');
          });
        };

        scope.close = function() {
          toggleModal(false);
        };
      }
    };
  }]);
})();
