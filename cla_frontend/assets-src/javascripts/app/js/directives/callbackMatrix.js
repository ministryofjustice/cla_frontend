(function () {
  'use strict';

  var mod = angular.module('cla.directives');

  var getDays = function (startDay) {
    var days = [
      {
        day: 1,
        text: 'Monday'
      },
      {
        day: 2,
        text: 'Tuesday'
      },
      {
        day: 3,
        text: 'Wednesday'
      },
      {
        day: 4,
        text: 'Thursday'
      },
      {
        day: 5,
        text: 'Friday'
      },
      {
        day: 6,
        text: 'Saturday'
      },
      {
        day: 7,
        text: 'Sunday'
      }
    ];

    // if start day is not Monday, shift to end until new start day is at the front
    if (startDay !== 1) {
      var currentDay = 1;
      while (currentDay < startDay) {
        days.push(days.shift());
        currentDay += 1;
      }
    }

    return days;
  };

  mod.directive('callbackMatrix', ['d3Service', '$window', '$timeout', '_', function (d3Service, $window, $timeout, _) {
    return {
      restrict: 'E',
      scope: {
        'data': '='
      },
      link: function (scope, ele, attrs) {
        d3Service.d3().then(function (d3) {
          // customisable options
          var startDay = parseInt(attrs.startDay) || new Date().getDay();
          var cellSpacing = attrs.cellSpacing ? parseInt(attrs.cellSpacing) : 4;

          // static options
          var renderTimeout;
          var colors = ['1', '2', '3', '4', '5', '6'];
          var times = [
            {
              hour: 9,
              text: '9am'
            },
            {
              hour: 10,
              text: '10am'
            },
            {
              hour: 11,
              text: '11am'
            },
            {
              hour: 12,
              text: '12pm'
            },
            {
              hour: 13,
              text: '1pm'
            },
            {
              hour: 14,
              text: '2pm'
            },
            {
              hour: 15,
              text: '3pm'
            },
            {
              hour: 16,
              text: '4pm'
            },
            {
              hour: 17,
              text: '5pm'
            },
            {
              hour: 18,
              text: '6pm'
            },
            {
              hour: 19,
              text: '7pm'
            }
          ];
          var days = getDays(startDay);
          var yLegendHeight = 25;
          var xLegendWidth = 65;
          var cellHeight = 60;
          var totalHeight = (times.length * (cellHeight + cellSpacing)) + yLegendHeight;

          ele.addClass('CallbackMatrix');

          var svg = d3.select(ele[0])
            .append('svg')
              .style('width', '100%')
              .style('height', totalHeight);

          $window.onresize = function () {
            scope.$apply();
          };

          scope.$watch(function () {
            return angular.element($window)[0].innerWidth;
          }, function () {
            scope.render(scope.data);
          });

          scope.$watch('data', function (newData) {
            scope.render(newData);
          }, true);

          scope.render = function (data) {
            svg.selectAll('*').remove();

            if (!data) { return; }
            if (renderTimeout) { clearTimeout(renderTimeout); }

            renderTimeout = $timeout(function () {
              var width = d3.select(ele[0])[0][0].offsetWidth;
              var cellWidth = Math.floor((width - xLegendWidth - ((days.length - 1) * cellSpacing)) / days.length);
              var colorScale = d3.scale
                .quantile()
                .domain([0, colors.length - 1, d3.max(data, function (d) { return d.value; })])
                .range(colors);

              // pattern defs
              svg.selectAll('defs').remove();
              svg
                .append('defs')
                  .append('pattern')
                    .attr('id', 'diagonalHatch')
                    .attr('patternUnits', 'userSpaceOnUse')
                    .attr('width', 4)
                    .attr('height', 4)
                  .append('path')
                    .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
                    .attr('stroke', '#ccc')
                    .attr('stroke-width', 1);

              // grid container
              svg.selectAll('.CallbackMatrix-grid').remove();
              var grid = svg
                .append('svg')
                  .attr('x', function () {
                    return xLegendWidth;
                  })
                  .attr('y', function () {
                    return yLegendHeight;
                  })
                  .attr('class', 'CallbackMatrix-grid');

              // grid day cols
              var cols = grid.selectAll('.CallbackMatrix-col')
                .data(days)
                .enter()
                  .append('g')
                    .attr('transform', function (d, i) {
                      return 'translate(' + i * (cellWidth + cellSpacing) + ',0)';
                    })
                    .attr('data-day', function (d) {
                      return d.day;
                    })
                    .attr('class', function (d) {
                      return d.day === 7 ? 'CallbackMatrix-col' : 'CallbackMatrix-col';
                    });

              // cells
              var cells = cols.selectAll('.CallbackMatrix-cellContainer')
                .data(times)
                .enter()
                  .append('g')
                  .attr('class', 'CallbackMatrix-cellContainer')
                  .attr('transform', function (d, i) {
                    return 'translate(0,' + i * (cellHeight + cellSpacing) + ')';
                  });

              // cell colour
              cells
                .append('rect')
                  .attr('width', cellWidth)
                  .attr('height', cellHeight)
                  .attr('class', function (d) {
                    var className = 'CallbackMatrix-cell';
                    var cellDay = parseInt(this.parentNode.parentNode.dataset.day);
                    var cellTime = d.hour;
                    var slot = _.findWhere(data, {day: cellDay, hour: cellTime});

                    if (slot) {
                      className += ' CallbackMatrix-density--' + colorScale(slot.value);
                    }
                    return className;
                  })
                  .style('fill', function (d) {
                    var cellDay = parseInt(this.parentNode.parentNode.dataset.day);
                    var cellTime = d.hour;

                    if (
                      cellDay === 7 ||
                      (cellDay === 6 && cellTime > 12)
                    ) {
                      return 'url(#diagonalHatch)';
                    }
                    return;
                  });

              // cell text
              cells
                .append('text')
                  .attr('x', 8)
                  .attr('y', 28)
                  .attr('class', 'CallbackMatrix-cellText')
                  .text(function (d) {
                    var cellDay = parseInt(this.parentNode.parentNode.dataset.day);
                    var cellTime = d.hour;
                    var slot = _.findWhere(data, {day: cellDay, hour: cellTime});

                    if (slot) {
                      return slot.value;
                    }
                    return;
                  });

              // x-axis labels (days)
              svg.selectAll('.xaxis')
                .data(days)
                .enter()
                  .append('text')
                    .text(function (d) { return d.text; })
                    .attr('y', 11)
                    .attr('x', function (d, i) {
                      return (i * (cellWidth + cellSpacing)) + xLegendWidth;
                    })
                    .attr('class', function (d) {
                      return d.day === 7 ? 'CallbackMatrix-label CallbackMatrix-label--unavailable xaxis' : 'CallbackMatrix-label xaxis';
                    });

              // y-axis labels (times)
              svg.selectAll('.yaxis')
                .data(times)
                .enter()
                  .append('text')
                    .text(function (d) { return d.text; })
                    .attr('x', 50)
                    .attr('y', function (d, i) {
                      return (i * (cellHeight + cellSpacing)) + (yLegendHeight + 5) + (cellHeight / 2);
                    })
                    .attr('class', 'CallbackMatrix-label yaxis')
                    .attr('text-anchor', 'end');
            }, 200);
          };
        });
      }
    };
  }]);
})();
