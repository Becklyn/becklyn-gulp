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
var scssLintReporter = require('gulp-scss-lint/src/reporters.js');
var autoprefixer = require("gulp-autoprefixer");
var glob = require("glob");
var sassHelpers = require("../lib/sass-helpers");
var path = require("path");
var gulpUtil = require("gulp-util");
var pathHelper = require("../lib/path-helper");

var totalIssues = 0;


/**
 * Wraps the default SCSS Lint Reporter and
 * counts the total amount of issues
 *
 * @param {{
 *      scsslint: {
 *          success: bool,
 *          errors: int,
 *          warnings: int,
 *          issues: Array.<{
 *              line: int,
 *              column: int,
 *              severity: string,
 *              reason: string,
 *          }>
 *      }}} file
 */
function issueCountReporter (file)
{
    if (!file.scsslint.success)
    {
        totalIssues += file.scsslint.issues.length;
    }

    scssLintReporter.defaultReporter(file);
}


/**
 * Prints the total issue count to the stdout
 *
 * @returns {*}
 */
function reportTotalIssueCount ()
{
    var outputColor = gulpUtil.colors.green;
    if (totalIssues > 0)
    {
        outputColor = gulpUtil.colors.red;
    }

    gulpUtil.log(gulpUtil.colors.yellow('»»'), 'Total CSS issues:', outputColor(totalIssues));

    // Reset the issue count so we don't increment it every time a file has been modified while it is being watched
    totalIssues = 0;
}


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
    var outputPath = "./" + path.dirname(filePath).replace("assets/scss", "public/css");
    gulpUtil.log(gulpUtil.colors.blue("Sass"), pathHelper.makeRelative(filePath), " -> ", outputPath + "/" + path.basename(filePath).replace(/\.scss$/, ".css"));

    var innerPipe = gulp.src(filePath)
        .pipe(plumber());

    if (isDebug)
    {
        innerPipe = innerPipe
            .pipe(watch(filePath));
    }

    innerPipe = innerPipe
        .pipe(sass({
            errLogToConsole: true,
            includePaths: [
                process.env.PWD
            ]
        }))
        .pipe(autoprefixer({
            browsers: options.browsers,
            cascade: false
        }));

    // if not in debug mode, minify
    if (!isDebug)
    {
        innerPipe = innerPipe.pipe(cssMin({
            processImport: false
        }));
    }

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
            config: __dirname + "/../config/scss-lint.yml",
            customReport: issueCountReporter
        }))
        .on('error', function (error)
        {
            gulpUtil.log(gulpUtil.colors.red('An error has occurred while executing scss-lint: ' + error.message));
        })
        .on('end', reportTotalIssueCount);
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
    return function (isDebug)
    {
        options = xtend({
            browsers: ["last 2 versions", "ie 9"],
            lint: isDebug
        }, options);


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
