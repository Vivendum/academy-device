"use strict";

var server = require("browser-sync").create();
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var rigger = require("gulp-rigger");
var sass = require("gulp-sass"); sass.compiler = require("node-sass");
var sourcemaps = require("gulp-sourcemaps");
var cache = require("gulp-cache");
var changed = require("gulp-changed");
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

gulp.task("build-css", function() {
   return gulp.src("source/style/style.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .pipe(gulp.dest("build/before/style/"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/after/style/"))
    .pipe(server.stream());
});

gulp.task("image-optimization", function() {
  return gulp.src("source/image/*.{jpg,png,svg}")
    .pipe(changed("build/after/image/"))
    .pipe(cache(imagemin([
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
    ])))
    .pipe(gulp.dest("build/after/image/"));
});

gulp.task("copy", function(done) {
  gulp.src("source/font/*.{ttf,woff,woff2}")
    .pipe(changed("build/after/font/"))
    .pipe(gulp.dest("build/after/font/"));
  done();
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

  gulp.watch("source/image/*.{jpg,png,svg}", gulp.series("image-optimization"));
  gulp.watch("source/template/**/*.html", gulp.series("build-html"));
  gulp.watch("source/style/**/*.scss", gulp.series("build-css"));
  gulp.watch("build/after/*.html").on("change", server.reload);
});

gulp.task("build", gulp.series("build-html"));
gulp.task("start", gulp.series("image-optimization", "copy", "build-html", "build-css", "server"));
