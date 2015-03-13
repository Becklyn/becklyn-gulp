"use strict";

/**
 * Task for linting javascript files
 *
 * @typedef {{
 *      rules: {
 *          esnext: boolean
 *      }
 * }} JsHintTaskOptions
 */

var jsHintHelper = require("../lib/jshint-helper");
var glob         = require("glob");
var watch        = require("gulp-watch");
var xtend        = require("xtend");


/**
 * Lints all files in a given glob
 *
 * @param {string} src
 * @param {JsHintTaskOptions} options
 */
function lintAllFiles (src, options)
{
    glob(src,
        function (err, files)
        {
            if (err) throw err;

            for (var i = 0, l = files.length; i < l; i++)
            {
                jsHintHelper.lintFile(files[i], options.rules);
            }
        }
    );
}


/**
 * Runs JSHint
 *
 * @param {string} src the glob to find the files
 * @param {JsHintTaskOptions} options
 * @returns {function(isDebug: bool)}
 */
module.exports = function (src, options)
{
    options = xtend({
        rules: {}
    }, options);

    return function (isDebug)
    {
        lintAllFiles(src, options);

        if (isDebug)
        {
            watch(src,
                function (file) {
                    if (file.path)
                    {
                        jsHintHelper.lintFile(file.path, options.rules);
                    }
                }
            );
        }
    };
};
