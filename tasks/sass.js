var gulp = require("gulp");
var getBaseDir = require("../lib/base-dir");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var prepareFileName = require("../lib/prepare-file-object");
var watch = require("gulp-watch");
var minifyCss = require("gulp-minify-css");
var libSass = require("gulp-sass");
var rubySass = require("gulp-ruby-sass");
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
    var sassCompilerPipe;

    options = xtend({
        compiler: "ruby"
    }, options);

    switch (options.compiler)
    {
        case "libsass":
            sassCompilerPipe = function (gulp) {
                return gulp
                    .pipe(libSass())
                    .pipe(minifyCss());
            };
            break;

        case "ruby":
            sassCompilerPipe = function (gulp) {
                return gulp
                    .pipe(rubySass({
                        style: "compressed",
                        sourcemap: isDebug ? "auto" : "none"
                    }));
            };
            break;
    }

    return function ()
    {
        var pipe = function (files)
        {
            var innerPipe = gulp.src(glob)
                .pipe(plumber());

            return sassCompilerPipe(innerPipe)
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
