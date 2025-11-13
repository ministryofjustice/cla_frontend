(function () {
  "use strict";

  /**
   * stripHtml directive
   *
   * Usage:
   *   <span strip-html="::x§log.notes"></span>
   *
   * Behavior:
   * - Removes ALL HTML tags from the given input string (plain-text only).
   * - Safe to require/parse in Node build/test pipelines (no document usage).
   * - Uses "=" isolate scope for widest Angular 1.x compatibility.
   *
   * Notes:
   * - If you use one-time bindings in templates (::log.notes) those still resolve
   *   correctly when assigned to the scope property before digest.
   * - This directive intentionally does not decode HTML entities (e.g. &lt;script&gt;),
   *   so escaped payloads remain inert.
   */
  angular.module("cla.directives").directive("stripHtml", [
    "$sanitize",
    function (sanitize) {
      return {
        restrict: "A",
        scope: {
          stripHtml: "=",
        },
        link: function (scope, element) {
          function clean(input) {
            if (input == null || typeof input !== "string") {
              return "";
            }

            // 1. Sanitise dangerous HTML
            var sanitised = sanitize(input);

            // 2. Remove any remaining HTML tags
            var text = sanitised.replace(/<[^>]*>/g, "");

            // 3. Whitespace
            return text.trim();
          }

          element.text(clean(scope.stripHtml));
        },
      };
    },
  ]);
})();
