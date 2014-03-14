(function () {
  'use strict';

  moj.Modules.Conditional = {
    el: '.js-Conditional',

    init: function () {
      var _this = this;

      this.cacheEls();
      this.bindEvents();

      this.$conditionals.each(function () {
        _this.toggleEl($(this));
      });
    },

    bindEvents: function () {
      var _this = this;

      // set focused selector to parent label
      this.$conditionals
        .on('change', function () {
          _this.toggleEl($(this));

          // trigger a deselect event
          $('input[name="' + $(this).attr('name') + '"]').not($(this)).trigger('deselect');
        })
        .on('deselect', function () {
          _this.toggleEl($(this));
        });
    },

    cacheEls: function () {
      this.$conditionals = $(this.el);
    },

    toggleEl: function (el) {
      var $el = el,
          $conditionalEl = $('#' + $el.data('conditionalEl'));

      if ($el.data('conditionalEl')) {
        $el.attr('aria-control', $el.data('conditionalEl'));

        if($el.is(':checked')){
          $conditionalEl.show();
          $conditionalEl.attr('aria-expanded', 'true').attr('aria-hidden', 'false');
        } else {
          $conditionalEl.hide();
          $conditionalEl.attr('aria-expanded', 'false').attr('aria-hidden', 'true');
        }
      }
    }
  };
}());