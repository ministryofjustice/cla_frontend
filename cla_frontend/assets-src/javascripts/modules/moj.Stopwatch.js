(function () {
  'use strict';

  var Stopwatch = function (el, options) {
    _.bindAll(this, 'setTime', 'formatTime');
    this.settings = $.extend({}, this.defaults, options);
    this.$el = $(el);

    this.currentTime = this.settings.startTime;
    this.start();
  };

  Stopwatch.prototype = {
    defaults: {
      startTime: 0,
      separator: ':'
    },

    start: function () {
      this.timer = setInterval(this.setTime, 1000);
    },

    stop: function () {
      clearTimeout(this.timer);
    },

    setTime: function () {
      this.currentTime += 1;
      this.$el.html(this.formatTime(this.currentTime));
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

  moj.Modules.Stopwatch = {
    init: function () {
      $('.js-Stopwatch').each(function () {
        $(this).data('moj.Stopwatch', new Stopwatch($(this), $(this).data()));
      });
    }
  };
}());