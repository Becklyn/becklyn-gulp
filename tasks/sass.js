var gulp = require("gulp");
var getBaseDir = require("../lib/base-dir");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var prepareFileName = require("../lib/prepare-file-object");
var watch = require("gulp-watch");
var xtend = require("xtend");

/**
 * Compiles SCSS/SASS
 *
 * @param {string} glob                 the glob to find the files
 * @param {boolean} isDebug             flag, whether this is the debug mode (will start a watcher)
 * @param {{compiler: string}} options     options
 * @returns {function}
 */
module.exports = function (glob, isDebug, options)
{
    var baseDir = getBaseDir(glob);
    var sassCompiler;

    options = xtend({
        compiler: "ruby"
    }, options);

    switch (options.compiler)
    {
        case "libsass":
            sassCompiler = require("gulp-sass")();
            break;

        case "ruby":
            sassCompiler = require("gulp-ruby-sass")({
                style: "compressed",
                sourcemap: isDebug ? "auto" : "none"
            });
            break;
    }

    return function ()
    {
        var pipe = function (files)
        {
            return gulp.src(glob)
                .pipe(plumber())
                .pipe(sassCompiler)
                .pipe(rename(prepareFileName(baseDir, "assets/scss", "public/css")))
                .pipe(gulp.dest("./"));
        };

        if (isDebug)
        {
            return watch({glob: glob}, pipe);
        }
        else
        {
            return pipe(gulp.src(glob));
        }
    };
};
