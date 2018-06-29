(function() {
  "use strict";

  var gulp = require("gulp");
  var sass = require("gulp-sass");
  var paths = require("./_paths");

  gulp.task("sass", ["iconfont"], function() {
    return gulp
      .src(paths.tmp + "stylesheets/**/*.scss")
      .pipe(
        sass({
          includePaths: "node_modules/govuk_frontend_toolkit/",
          outputStyle: "compact"
        }).on("error", sass.logError)
      )
      .pipe(gulp.dest(paths.dest + "stylesheets/"));
  });
})();
