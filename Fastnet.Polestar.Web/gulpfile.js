/// <binding BeforeBuild='build:prebuild' />
"use strict";
var gulp = require("gulp");
var concat = require("gulp-concat");
var sass = require("gulp-sass");

gulp.task("sass:lib", function () {
    gulp.src("./scripts/lib/*.scss")
    .pipe(sass())
    .pipe(gulp.dest("./wwwroot/css"));
    console.log("-----------converted ./scripts/lib/*.scss -----------");
});
gulp.task("sass:core", function () {
    gulp.src("./sass/core.scss")
    .pipe(sass())
    .pipe(gulp.dest("./wwwroot/css"));
    console.log("-----------converted core.scss -----------");
});
gulp.task("sass:all", [
    "sass:core", "sass:lib"
]);

gulp.task("css:common", function () {
    gulp.src([
        "./wwwroot/lib/normalize-css/normalize.css",
        "./wwwroot/lib/font-awesome/css/font-awesome.css",
        "./wwwroot/css/busyIndicator.css",
        "./wwwroot/css/forms.css"
    ])
    .pipe(concat("common.css"))
    .pipe(gulp.dest("./wwwroot/css"));
    console.log("-----------bundle common.css created -----------");
});
gulp.task("css:site", function () {
    gulp.src([
        "./wwwroot/css/common.css",
        "./wwwroot/css/core.css"
     ])
    .pipe(concat("site.css"))
    .pipe(gulp.dest("./wwwroot/css"));
    console.log("-----------bundle site.css created -----------");
});
gulp.task("css:all", [
    "css:common", "css:site"
]);

gulp.task("build:prebuild", [
    "sass:all",
    "css:all"
]);