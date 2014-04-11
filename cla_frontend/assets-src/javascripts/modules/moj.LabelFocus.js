(function () {
  'use strict';

  moj.Modules.LabelFocus = {
    el: '.js-LabelFocus',

    init: function () {
      this.cacheEls();
      this.bindEvents();
    },

    cacheEls: function () {
      this.$inputs = $(this.el);
    },

    bindEvents: function () {
      // set focused selector to parent label
      this.$inputs
        .on('focus', this.onFocus)
        .on('focusout', this.onFocusOut);
    },

    onFocus: function (e) {
      var $el = $(e.target);

      // also apply class to element for more control
      $el.addClass('is-focused');

      // catch both parent and sibling labels
      if ($el.parent('label').length > 0) {
        $el.parent('label').addClass('is-focused');
      } else {
        $el.siblings('label').addClass('is-focused');
      }
    },

    onFocusOut: function () {
      $('.is-focused').removeClass('is-focused');
    }
  };
}());