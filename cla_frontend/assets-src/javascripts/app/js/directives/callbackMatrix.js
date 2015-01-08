(function() {
  'use strict';

  var mod = angular.module('cla.directives');

  mod.directive('callbackMatrix', ['d3Service', '$window', '$timeout', function (d3Service, $window, $timeout) {
    return {
      restrict: 'E',
      scope: {
        'data': '='
      },
      link: function (scope, ele, attrs) {
        d3Service.d3().then(function(d3) {
          var renderTimeout;
          var buckets = 5;
          var colors = ['#f8f8f8', '#dee0e2', '#bfc1c3', '#6f777b', '#0b0c0c'];
          var days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
          var times = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];
          // var margin = parseInt(attrs.margin) || 20;
          // var barHeight = parseInt(attrs.barHeight) || 20;
          // var barPadding = parseInt(attrs.barPadding) || 5;

          var svg = d3.select(ele[0])
                      .append('svg')
                      .style('width', '100%')
                      .style('height', '800px');

          scope.render = function(data) {
            svg.selectAll('*').remove();

            if (!data) {
              return;
            }
            if (renderTimeout) {
              clearTimeout(renderTimeout);
            }

            renderTimeout = $timeout(function() {
              var width = d3.select(ele[0])[0][0].offsetWidth;
              // var height = scope.data.length * (barHeight + barPadding);
              var gridWidth = Math.floor((width - 100) / 7);
              var gridHeight = 50;
                  // color = d3.scale.category20(),
                  // xScale = d3.scale.linear()
                  //   .domain([0, d3.max(data, function(d) {
                  //     return d.score;
                  //   })])
                  //   .range([0, width]);

              var colorScale = d3.scale
                                  .quantile()
                                  .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
                                  .range(colors);

              // days
              svg.selectAll('.CallbackMatrix-day')
                  .data(days)
                  .enter().append('text')
                    .text(function (d) { return d; })
                    .attr('x', function (d, i) { return (i * gridWidth) + (gridWidth / 2 - 14); })
                    .attr('y', 0)
                    .attr('transform', 'translate(100,20)')
                    .attr('class', function (d, i) { return (i === 7 ? 'CallbackMatrix-day' : 'CallbackMatrix-day CallbackMatrix-day--sunday'); });

              // times
              svg.selectAll('.CallbackMatrix-time')
                  .data(times)
                  .enter().append('text')
                    .text(function (d) { return d; })
                    .attr('x', 0)
                    .attr('y', function (d, i) { return (i * gridHeight) + (gridHeight / 2); })
                    .style('text-anchor', 'end')
                    .attr('transform', 'translate(70,55)')
                    .attr('class', 'CallbackMatrix-time');

              // heatmap
              var heatMap = svg.selectAll('.CallbackMatrix-hour')
                  .data(data)
                  .enter().append('rect')
                  .attr('y', function(d) { return (d.hour - 1) * gridHeight + 50; })
                  .attr('x', function(d) { return (d.day - 1) * gridWidth + 100; })
                  .attr('width', gridWidth)
                  .attr('height', gridHeight)
                  .attr('class', function (d) {
                    return (d.day === 7 ? 'CallbackMatrix-hour' : 'CallbackMatrix-hour CallbackMatrix-hour--sunday');
                  })
                  .style('fill', colors[0]);

              heatMap.transition().duration(250)
                  .style('fill', function(d) { return colorScale(d.value); });
            }, 200);
          };

          scope.render(scope.data);
        });
      }
    };
  }]);
})();
