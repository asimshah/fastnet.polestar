var debug = require("gulp-debug"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    plumber = require("gulp-plumber"),
    eol = require("gulp-eol");

    module.exports = function (gulp, files, dest) {
        return function () {
            return gulp.src(files)
            .pipe(plumber(function (error) {
                gutil.log(error.message);
                this.emit('end');
            }))
             .pipe(cssmin())
            .pipe(debug({ title: 'minimise: ' }))
            .pipe(concat(dest))
            .pipe(eol())
            .pipe(gulp.dest("."));
        };
    };