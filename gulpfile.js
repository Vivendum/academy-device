"use strict";

var server = require("browser-sync").create();
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var rigger = require("gulp-rigger");
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");

gulp.task("build-html", function() {
  return gulp.src("source/template/*.html")
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest("build/before"))
    .pipe(gulp.dest("build/after"))
    .pipe(server.stream());
});

gulp.task("image-optimization", function() {
  return gulp.src("source/image/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.svgo({
        js2svg: {
          pretty: true,
          indent: 2
        },
        plugins: [{
          removeViewBox: false
          }, {
          cleanupNumericValues: {
            floatPrecision: 2
            }
          }, {
          sortAttrs: true
        }]
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      pngquant()
    ]))
    .pipe(gulp.dest("build/after/image/"));
});

gulp.task("server", function () {
  server.init({
    server: "build/after",
    index: "main.html",
    notify: false,
    open: true,
    cors: true,
    ui: false,
    browser: "firefox"
  });

  gulp.watch("source/template/**/*.html", gulp.series("build-html"));
  gulp.watch("build/after/*.html").on("change", server.reload);
});

gulp.task("build", gulp.series("build-html"));
gulp.task("start", gulp.series("build-html", "server"));
