(function () {
  "use strict";

  angular.module("cla.directives").directive("stripHtml", [
    "$sanitize",
    function (sanitize) {
      return {
        restrict: "A",
        scope: {
          stripHtml: "=",
        },
        link: function (scope, element) {
          /**
           * Decodes HTML entities in a string by using a textarea element.
           * Converts HTML encoded characters (e.g., &lt;, &gt;, &amp;) back to their original form.
           *
           * @param {string} input - The HTML-encoded string to decode
           * @returns {string} The decoded string with HTML entities converted to their character equivalents
           *
           * @example
           * decode("&lt;div&gt;Hello&lt;/div&gt;") // returns "<div>Hello</div>"
           * decode("&amp;copy; 2024") // returns "© 2024"
           */
          function decode(input) {
            var content = document.createElement("textarea");
            content.innerHTML = input;

            return content.value;
          }

          /**
           * Cleans and sanitises HTML input by removing dangerous HTML, stripping tags, decoding entities, and trimming whitespace.
           *
           * @param {string} input - The HTML string to be cleaned
           * @returns {string} The cleaned text with HTML removed, entities decoded, and whitespace trimmed. Returns empty string if input is null or not a string.
           */
          function clean(input) {
            if (input == null || typeof input !== "string") {
              return "";
            }

            // 1. Sanitise dangerous HTML
            var sanitised = "";
            try {
              sanitised = sanitize(input);
            } catch (error) {}

            // 2. Remove any remaining HTML tags
            var text = sanitised.replace(/<[^>]*>/g, "");

            // 3. Decode entities
            var decoded = decode(text);

            // 4. Whitespace
            return decoded.trim();
          }

          element.text(clean(scope.stripHtml));
        },
      };
    },
  ]);
})();
