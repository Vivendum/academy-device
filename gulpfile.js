"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");

gulp.task("build-html", function() {
  return gulp.src("source/template/*.html")
    .pipe(plumber())
    .pipe(gulp.dest("build/before"))
    .pipe(gulp.dest("build/after"));
});

gulp.task("build", gulp.series("build-html"));
gulp.task("start", gulp.series("build-html"));
