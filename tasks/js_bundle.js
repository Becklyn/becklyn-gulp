"use strict";

/**
 * Task for compiling javascript files using webpack
 *
 * @typedef {{
 *      externals: Array.<string, string>,
 *      lint: boolean,
 *      logCachedFiles: boolean,
 *      useBabel: true,
 *      moduleLoaders: Array
 * }} JsBundleTaskOptions
 */

var gulpUtil = require("gulp-util");
var webpack = require("webpack");
var glob = require("glob");
var path = require("path");
var xtend = require("xtend");
var pathHelper = require("../lib/path-helper");
var jsHintConfigHelper = require("../config/jshint");

var totalIssues = 0;


/**
 * Logs jsHint warnings to the console
 *
 * @param {Array.<{
 *      raw: string,
 *      code: string,
 *      evidence: string,
 *      line: number,
 *      character: number,
 *      scope: string,
 *      reason: string
 * }>} errors
 */
function logJsHintWarning (errors)
{
    totalIssues += errors.length;

    var sourceFile = pathHelper.makeRelative(this.resourcePath);
    gulpUtil.log(gulpUtil.colors.yellow("jshint warning") + " in " + sourceFile);

    for (var i = 0, l = errors.length; i < l; i++)
    {
        var error = errors[i];

        gulpUtil.log(
            "    in " +
            gulpUtil.colors.blue("line " + error.line + " @ char " + error.character) +
            ": " +
            error.reason +
            " (" + error.code + ")"
        );

        if (typeof error.evidence === "string")
        {
            gulpUtil.log(
                "        " +
                gulpUtil.colors.gray(error.evidence.replace(/^\s*|\s*$/, ""))
            );
        }

        gulpUtil.log("");
    }
}


/**
 * Reports the total amount of JavaScript issues detected by JsHint
 */
function reportTotalIssueCount ()
{
    var outputColor = gulpUtil.colors.green;
    if (totalIssues > 0)
    {
        outputColor = gulpUtil.colors.red;
    }

    gulpUtil.log(gulpUtil.colors.yellow('»»'), 'Total JS issues:', outputColor(totalIssues));

    // Reset the issue count so we don't increment it every time a file has been modified while it is being watched
    totalIssues = 0;
}


/**
 *
 * @param {string} filePath
 * @param {boolean} isDebug
 * @param {JsBundleTaskOptions} options
 */
function compileSingleFile (filePath, isDebug, options)
{
    var outputPath = path.dirname(filePath).replace("/assets/js", "/public/js");

    var webpackConfig = {
        entry: filePath,
        output: {
            path: outputPath,
            filename: path.basename(filePath)
        },
        externals: options.externals,
        module: {
            loaders: options.moduleLoaders
        },
        resolve: {
            root: [path.join(process.env.PWD, "bower_components")]
        },
        watch: isDebug,
        debug: isDebug,
        plugins: options.plugins.slice(), // use copy of original plugins array to not modify it
        resolveLoader: {
            root: path.join(path.dirname(__dirname), "node_modules")
        }
    };

    if (options.useBabel)
    {
        webpackConfig.module.loaders.push({
            test: /\.js$/,
            exclude: /\/node_modules|bower_components\//,
            loader: "babel"
        });
    }

    if (options.lint)
    {
        webpackConfig.module.preLoaders = [{
            test: /\.js$/,
            exclude: /\/(node_modules|vendor|bower_components)\//,
            loader: "jshint"
        }];

        webpackConfig.jshint = jsHintConfigHelper.getRules({
            reporter: logJsHintWarning,
            esnext: options.useBabel
        });
    }

    if (isDebug)
    {
        webpackConfig.devtool = "inline-source-map";
    }
    else
    {
        webpackConfig.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        );
    }

    webpack(webpackConfig,
        function (err, stats)
        {
            if (err) throw new gulpUtil.PluginError("webpack", err);

            gulpUtil.log(gulpUtil.colors.blue("webpack"), pathHelper.makeRelative(filePath), " -> ", pathHelper.makeRelative(outputPath) + "/" + path.basename(filePath));
            gulpUtil.log(stats.toString({
                colors: true,
                version: false,
                hash: false,
                cached: options.logCachedFiles
            }));

            if (isDebug)
            {
                reportTotalIssueCount();
            }
        }
    );
}


/**
 *
 * @param {string} src          the glob to find the files
 * @param {boolean} isDebug     flag, whether this is the debug mode (will start a watcher)
 * @param {JsBundleTaskOptions} options
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
 * Compiles and bundles JavaScript using webpack
 *
 * @param {string} src        the glob to find the files
 * @param {JsBundleTaskOptions} options
 * @returns {function(isDebug: bool)}
 */
module.exports = function (src, options)
{
    if (0 !== src.indexOf("./") && 0 !== src.indexOf("/"))
    {
        src = "./" + src;
    }

    return function (isDebug)
    {
        options = xtend({
            externals: {
                "jquery": "window.jQuery",
                "routing": "window.Routing"
            },
            lint: isDebug,
            logCachedFiles: false,
            useBabel: true,
            moduleLoaders: [],
            plugins: []
        }, options);

        options.plugins.push(
            new webpack.optimize.OccurenceOrderPlugin(true)
        );
        options.plugins.push(
            new webpack.ResolverPlugin(
                new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
            )
        );

        compileAllFiles(src, isDebug, options);
    };
};
