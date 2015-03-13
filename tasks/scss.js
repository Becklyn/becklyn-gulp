"use strict";


/**
 * Task for compiling Sass files
 *
 * @typedef {{
 *      browsers: Array.<string>,
 *      lint: boolean
 * }} SassTaskOptions
 */

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var watch = require("gulp-watch");
var cssMin = require("gulp-minify-css");
var sass = require("gulp-sass");
var xtend = require("xtend");
var scssLint = require('gulp-scss-lint');
var autoprefixer = require("gulp-autoprefixer");
var glob = require("glob");
var sassHelpers = require("../lib/sass-helpers");
var path = require("path");
var gulpUtil = require("gulp-util");
var pathHelper = require("../lib/path-helper");


/**
 * Compiles a single Sass file
 *
 * @param {string} filePath
 * @param {boolean} isDebug
 * @param {SassTaskOptions} options
 * @returns {*}
 */
function compileSingleFile (filePath, isDebug, options)
{
    gulpUtil.log(gulpUtil.colors.blue("Sass"), pathHelper.makeRelative(filePath));

    var innerPipe = gulp.src(filePath)
        .pipe(plumber());

    if (isDebug)
    {
        innerPipe = innerPipe
            .pipe(watch(filePath));
    }

    innerPipe = innerPipe
        .pipe(sass({
            errLogToConsole: true
        }))
        .pipe(autoprefixer({
            browsers: options.browsers,
            cascade: false
        }));

    // if not in debug mode, minify
    if (!isDebug)
    {
        innerPipe = innerPipe.pipe(cssMin());
    }

    var outputPath = "./" + path.dirname(filePath).replace("assets/scss", "public/css");

    // write auto prefixer
    return innerPipe
        .pipe(gulp.dest(outputPath));
}



/**
 * Lints the given files
 *
 * @param {string} src
 */
function lintFiles (src)
{
    gulp.src(src)
        .pipe(scssLint({
            config: __dirname + "/../config/scss-lint.yml"
        }));
}



/**
 * Starts a watcher that lints the changed files
 *
 * @param {string} src
 */
function startWatcherForLinting (src)
{
    watch(src,
        function (file)
        {
            if (file.path)
            {
                lintFiles(file.path);
            }
        }
    );
}



/**
 * Compiles all files in the given selector
 *
 * @param {string} src all what is accepted by glob
 * @param {bool} isDebug
 * @param {SassTaskOptions} options
 */
function compileAllFiles (src, isDebug, options)
{
    glob(src,
        function (err, files)
        {
            if (err) throw err;

            for (var i = 0, l = files.length; i < l; i++)
            {
                // only start compilation at root files
                if (sassHelpers.isRootFile(files[i]))
                {
                    compileSingleFile(files[i], isDebug, options);
                }
            }
        }
    );
}



/**
 * Compiles SCSS
 *
 * @param {string} src               the glob to find the files
 * @param {SassTaskOptions} options  options
 * @returns {function(isDebug: bool)}
 */
module.exports = function (src, options)
{
    options = xtend({
        browsers: ["last 2 versions", "ie 9"],
        lint: true
    }, options);

    return function (isDebug)
    {
        if (options.lint)
        {
            // initially lint all files
            lintFiles(src);
        }

        compileAllFiles(src, isDebug, options);

        if (isDebug)
        {
            if (options.lint)
            {
                // start lint watcher
                startWatcherForLinting(src);
            }

            watch(src,
                function () {
                    compileAllFiles(src, isDebug, options);
                }
            );
        }
    };
};
