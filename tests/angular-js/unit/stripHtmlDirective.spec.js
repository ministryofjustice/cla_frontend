(function () {
  "use strict";

  describe("Directive: stripHtml", function () {
    var $compile, $rootScope;

    var assertions = [
      {
        input: "<b>Test</b> <i>XSS</i>",
        output: "Test XSS",
      },
      {
        input: "<script>alert('XSS');</script>",
        output: "",
      },
      {
        input: "<script>alert('XSS');</script>Click",
        output: "Click",
      },
      {
        input: "<img src=x onerror=alert(1)>Hi",
        output: "Hi",
      },
      {
        input:
          "<h1>Heading<h1> <b>Bold</b> <img src=x onerror=alert(1)>Test<object src='data:123' />",
        output: "Heading Bold Test",
      },
      {
        input: null,
        output: "",
      },
      {
        input: undefined,
        output: "",
      },
      {
        input: "Test 1 & 2",
        output: "Test 1 & 2",
      },
      {
        input: "&lt;script&gt;alert(1)&lt;/script&gt;",
        output: "<script>alert(1)</script>",
      },
      {
        input: "<scr<script>ipt>alert(document.cookie)</script>",
        output: "",
      },
    ];

    // Load directives
    beforeEach(module("ngSanitize"));
    beforeEach(module("cla.directives"));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    function compileDirective(input) {
      var scope = $rootScope.$new();
      scope.input = input;

      var element = $compile('<span strip-html="input"></span>')(scope);
      scope.$digest();

      return element;
    }

    assertions.forEach(function (assertion) {
      it("should sanitise the supplied input: " + assertion.input, function () {
        // Arrange + Act
        var element = compileDirective(assertion.input);

        // Assert
        expect(element.text()).toEqual(assertion.output);
      });
    });
  });
})();
