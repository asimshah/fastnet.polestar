'use strict';
var debug = require("gulp-debug"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    plumber = require("gulp-plumber"),
    eol = require("gulp-eol");

module.exports = function (gulp, files, dest, allFile) {
    return function () {
        //files.forEach(function (val, index, obj) {
        //    gutil.log(index, val);
        //});
        gutil.log("final is ", dest + " / " + allFile);
        return gulp.src(files)
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(debug({ title: 'copyfiles: ' }))
        .pipe(gulp.dest(dest))
        //.pipe(debug({ title: 'outfiles: ' }))
        .pipe(concat(dest + "/" + allFile))
        .pipe(eol())
        .pipe(gulp.dest("."));
    };
};