var debug = require("gulp-debug"),
    gutil = require("gulp-util"),
    concat = require("gulp-concat"),
    sass = require("gulp-sass"),
    plumber = require("gulp-plumber")
    eol = require("gulp-eol");

    module.exports = function (gulp, files, dest, allFile) {
        gutil.log(">>" + allFile);
    return function () {
        return gulp.src(files)
        .pipe(plumber(function (error) {
            gutil.log(error.message);
            this.emit('end');
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(debug({ title: 'sass2css: ' }))
        .pipe(gulp.dest(dest))        
        .pipe(concat(dest + "/" + allFile))
        .pipe(debug({ title: 'sass2css: ' }))
        .pipe(eol())
        .pipe(gulp.dest("."));
    }
}