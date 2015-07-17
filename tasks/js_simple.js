"use strict";

/**
 * Task for compiling javascript files using uglify
 *
 * @typedef {{
 *      lint: boolean
 * }} UglifyTaskOptions
 */

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var uglify = require("gulp-uglify");
var watch = require("gulp-watch");
var glob = require("glob");
var path = require("path");
var xtend = require("xtend");
var gulpUtil = require("gulp-util");
var jsHintHelper = require("../lib/jshint-helper");
var pathHelper = require("../lib/path-helper");


/**
 * Compiles a single file
 *
 * @param {string} filePath
 * @param {boolean} isDebug
 * @param {UglifyTaskOptions} options
 * @returns {*}
 */
function compileSingleFile (filePath, isDebug, options)
{
    var outputPath = "./" + path.dirname(filePath).replace(/(^|\/)assets\/js/, "$1public/js");
    var uglifyOptions = {};

    gulpUtil.log(gulpUtil.colors.blue("Uglify"), pathHelper.makeRelative(filePath), " -> ", pathHelper.makeRelative(outputPath) + "/" + path.basename(filePath));

    if (options.lint)
    {
        jsHintHelper.lintFile(filePath);
    }

    if (isDebug)
    {
        uglifyOptions.compress = false;
        uglifyOptions.preserveComments = "all";
    }

    return gulp.src(filePath)
        .pipe(plumber())
        .pipe(uglify(uglifyOptions))
        .pipe(gulp.dest(outputPath));
}



/**
 * Compiles all files included in the src glob
 *
 * @param {string} src
 * @param {boolean} isDebug
 * @param {UglifyTaskOptions} options
 */
function compileAllFiles (src, isDebug, options)
{
    glob(src,
        function (err, files)
        {
            if (err) throw err;

            for (var i = 0, l = files.length; i < l; i++)
            {
                compileSingleFile(files[i], isDebug, options);
            }
        }
    );
}



/**
 * Compiles JavaScript using uglifyjs
 *
 * @param {string} src         the glob to find the files
 * @param {UglifyTaskOptions} options
 * @returns {function(isDebug: bool)}
 */
module.exports = function (src, options)
{
    return function (isDebug)
    {
        options = xtend({
            lint: isDebug
        }, options);

        compileAllFiles(src, isDebug, options);

        if (isDebug)
        {
            watch(src,
                function (file) {
                    if (file.path)
                    {
                        compileSingleFile(file.path, isDebug, options);
                    }
                }
            );
        }
    };
};
