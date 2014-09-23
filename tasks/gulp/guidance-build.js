(function(){
  'use strict';
  
  var gulp = require('gulp');
  var markdownToJson = require('gulp-markdown-to-json');
  var paths = require('./_paths');
  var lunr = require('lunr');
  var gutil = require('gulp-util');
  var through2 = require('through2');
  var path = require('path');
  var S = require('string');
  var fs = require('fs');

  gulp.task('guidance-build', function() {
    var index;

    index = lunr(function () {
      this.field('title', {boost: 10});
      this.field('tags', {boost: 8});
      this.field('body');
      this.ref('id');
    })
    index._claTitles = {};

    gulp.src(paths.guidance)
      .pipe(markdownToJson())
      .pipe(through2.obj(function (file, enc, callback) {
          // adding to index
        var jsonFile = JSON.parse(file.contents.toString()),
            fileName = path.basename(file.path, '.json');

        index.add({
          id: fileName,
          title: jsonFile.title,
          tags: jsonFile.tags,
          body: S(jsonFile.body).stripTags()
        });

        // non-standard thing
        index._claTitles[fileName] = jsonFile.title;

        // creating output file
        var outputFile = new gutil.File({
          base: path.dirname(file.path),
          path: path.join(path.dirname(file.path), fileName+'.html'),
          contents: new Buffer(jsonFile.body)
        });

        this.push(outputFile);
        callback();
      }))
      .pipe(gulp.dest(paths.dest + 'guidance'))
      .pipe(gutil.buffer())
      .pipe(through2.obj(function (input, enc, callback) {
        var outputFile = fs.openSync(paths.dest + 'javascripts/guidance_index.json', 'w+'),
            indexJSON = index.toJSON();

        // non-standard thing
        indexJSON['_claTitles'] = index._claTitles;

        fs.writeSync(outputFile, JSON.stringify(indexJSON));
        fs.closeSync(outputFile);
      }));
  });
})();
