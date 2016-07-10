/// <binding ProjectOpened='start' />
"use strict";
var gulp = require("gulp");
//
function getTask(task) {
    return require('./gulp-tasks/' + task);
}

//
var copyFiles = getTask('copyfiles');
var sass2css = getTask('sass2css');
var minimiseCss = getTask('minimiseCss');
var minimiseScript = getTask('minimiseScript');
//
var libPackages = "./wwwroot/bower-packages/";
var sassFolder = "./sass/";
var scriptFolder = "./wwwroot/scripts/";
//
var standardCssLibFolder = "./wwwroot/css/lib"; // all individual css files from packages are placed here
var standardCssFolder = "./wwwroot/css"; // all individual css files from the project are placed here
var allCssFile = "all.css";

var packageCssFiles = [
    libPackages + "normalize-css/normalize.css",
    libPackages + "font-awesome/css/font-awesome.css",
    libPackages + "fastnet/busyIndicator.css",
    libPackages + "fastnet/forms.css"
];

var commonSassFiles = [
    sassFolder + "core.scss"
];

var allDesktopCssFile = "desktop.css";
var desktopSassFiles = [
    sassFolder + "catalogue.scss"
];

var finalCssFiles = [
    standardCssLibFolder + "/all.css",
    standardCssFolder + "/all.css"
];
var finalDesktopCssFiles = [
    standardCssFolder + "/desktop.css"
];
var commonCssFile = standardCssFolder + "/common.min.css";
var desktopCssFile = standardCssFolder + "/desktop.min.css";

var standardScriptLibFolder = "./wwwroot/js/lib"; // all individual js files from external or fastnet packages are placed here
var standardScriptFolder = "./wwwroot/js";


var allExternalScriptFile = "external.min.js";
var externalPackageScripts = [
    libPackages + "es6-promise/es6-promise.min.js",
    libPackages + "jquery/dist/jquery.min.js",
    libPackages + "signalr/jquery.signalR.min.js",
    libPackages + "moment/min/moment.min.js",
    libPackages + "knockout/dist/knockout.js",
    libPackages + "knockout-validation/dist/knockout.validation.min.js",
    libPackages + "interact/dist/interact.min.js"
];
var allFastnetScriptFile = "fastnet.js";
var fastnetPackageScripts = [
    // a good place to find the right order for fastnet files is fastnet/fastnet.d.ts!!
    libPackages + "fastnet/javascriptExtensions.js",
    libPackages + "fastnet/debug.js",
    libPackages + "fastnet/busyIndicator.js",
    libPackages + "fastnet/collections.js",
    libPackages + "fastnet/date.js",
    libPackages + "fastnet/ajax.js",
    libPackages + "fastnet/template.js",
    libPackages + "fastnet/knockout.js",
    libPackages + "fastnet/jqhelper.js",
    libPackages + "fastnet/commands.js",
    libPackages + "fastnet/messagehub.js",
    libPackages + "fastnet/forms.js"
];
var commonScriptFiles = [
    standardScriptLibFolder + "/fastnet.js",
    scriptFolder + "home.js"
];
var desktopScriptFiles = [

];
var mobileScriptFiles = [

];
var startupScriptFiles = [

];
var commonScript = standardScriptFolder + "/site.min.js";
var desktopScript = standardScriptFolder + "/desktop.min.js";
var mobileScript = standardScriptFolder + "/mobile.min.js";
var startupScript = standardScriptFolder + "/startup.min.js";
// copy:packagecss
// copies the files in the packageCssFiles list to standardCssLibFolder
// and then concatanates them (in order) into an allCssFile also in standardCssLibFolder
// MAKE SURE THIS IS RUN if the package css changes in any way
gulp.task('copy:packagecss', copyFiles(gulp, packageCssFiles, standardCssLibFolder, allCssFile));

// sass:common
// converts scss files in the commonSassFiles list to individual css files in standardCssFolder
// and then concatanates them (in order) into an allCssFile also in standardCssFolder
gulp.task('sass:common', sass2css(gulp, commonSassFiles, standardCssFolder, allCssFile));

// sass:desktop
// converts scss files in the commonSassFiles list to individual css files in standardCssFolder
// and then concatanates them (in order) into an allCssFile also in standardCssFolder
gulp.task('sass:desktop', sass2css(gulp, desktopSassFiles, standardCssFolder, allDesktopCssFile));

// create:commonCss
// concatanates the finalCssFiles (i.e. the 'all' files previously created
// and minimises them
gulp.task('create:commonCss', ['sass:common'], minimiseCss(gulp, finalCssFiles, commonCssFile));

// create:desktopCss
// concatanates the finalCssFiles (i.e. the 'all' files previously created
// and minimises them
gulp.task('create:desktopCss', ['sass:desktop'], minimiseCss(gulp, finalDesktopCssFiles, desktopCssFile));

// copy:externalScript
// copies the files in the externalPackageScripts list to standardScriptLibFolder
// and then concatanates them (in order) into an allExternalScriptFile also in standardScriptLibFolder
// MAKE SURE THIS IS RUN if the package css changes in any way
gulp.task('copy:externalScript', copyFiles(gulp, externalPackageScripts, standardScriptLibFolder, allExternalScriptFile));
// copy:fastnetScript
// copies the files in the fastnetPackageScripts list to standardScriptLibFolder
// and then concatanates them (in order) into an allFastnetScriptFile also in standardScriptLibFolder
// MAKE SURE THIS IS RUN if the package css changes in any way
gulp.task('copy:fastnetScript', copyFiles(gulp, fastnetPackageScripts, standardScriptLibFolder, allFastnetScriptFile));

// create:commonScript
// concatanates the final script files
// and minimises them
gulp.task('create:commonScript', ['copy:fastnetScript', 'copy:externalScript'], minimiseScript(gulp, commonScriptFiles, commonScript));

gulp.task('create:desktopScript', minimiseScript(gulp, desktopScriptFiles, desktopScript));
gulp.task('create:mobileScript', minimiseScript(gulp, mobileScriptFiles, mobileScript));
gulp.task('create:startupScript', minimiseScript(gulp, startupScriptFiles, startupScript));

gulp.task("sass:watch", function () {
    return gulp.watch(sassFolder + "**/*.scss", ['create:commonCss', 'create:desktopCss']);
});
gulp.task("packagescript:watch", function () {
    return gulp.watch(libPackages + "**/*.js", ['create:commonScript']);
});
gulp.task("script:watch", function () {
    return gulp.watch(scriptFolder + "**/*.js", ['create:commonScript', 'create:desktopScript', 'create:mobileScript', 'create:startupScript']);
});
gulp.task("start", ['create:commonCss', 'create:commonScript', 'create:desktopCss', 'create:desktopScript', 'create:mobileScript', 'create:startupScript', 'sass:watch', 'script:watch', 'packagescript:watch']);