(function () {
  "use strict";

  describe("Directive: stripHtml", function () {
    var $compile, $rootScope;

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

    it("should remove <b> and <i> HTML tags", function () {
      // Arrange + Act
      var element = compileDirective("<b>Test</b> <i>XSS</i>");

      // Assert
      expect(element.text()).toEqual("Test XSS");
    });

    it("should remove <script> tags", function () {
      // Arrange + Act
      var element = compileDirective("<script>alert('XSS');</script>");

      // Assert
      expect(element.text()).toEqual("");
    });

    it("should remove <script> tag", function () {
      // Arrange + Act
      var element = compileDirective("<script>alert('XSS');</script>Click");

      // Assert
      expect(element.text()).toEqual("Click");
    });

    it("should remove <img> tag", function () {
      // Arrange + Act
      var element = compileDirective("<img src=x onerror=alert(1)>Hi");

      // Assert
      expect(element.text()).toEqual("Hi");
    });

    it("should remove various HTML tags", function () {
      // Arrange + Act
      var element = compileDirective(
        "<h1>Heading<h1> <b>Bold</b> <img src=x onerror=alert(1)>Test<object src='data:123' />"
      );

      // Assert
      expect(element.text()).toEqual("Heading Bold Test");
    });

    it("should handle null safely", function () {
      // Arrange + Act
      var element = compileDirective(null);

      // Assert
      expect(element.text()).toEqual("");
    });

    it("should handle undefined safely", function () {
      // Arrange + Act
      var element = compileDirective(undefined);

      // Assert
      expect(element.text()).toEqual("");
    });

    it("should handle plain text safely with ampersand", function () {
      // Arrange + Act
      var element = compileDirective("Test 1 & 2");

      // Assert
      expect(element.text()).toEqual("Test 1 & 2");
    });

    it("should handle plain text safely with HTML entities", function () {
      // Arrange + Act
      var element = compileDirective("&lt;script&gt;alert(1)&lt;/script&gt;");

      // Assert
      expect(element.text()).toEqual("<script>alert(1)</script>");
    });

    it("should handle non-recursive filtering", function () {
      // Arrange + Act
      var element = compileDirective(
        "<scr<script>ipt>alert(document.cookie)</script>"
      );

      // Assert
      expect(element.text()).toEqual("");
    });
  });
})();
