var gulp            = require("gulp");
var getBaseDir      = require("../lib/base-dir");
var plumber         = require("gulp-plumber");
var sass            = require("gulp-ruby-sass");
var rename          = require("gulp-rename");
var prepareFileName = require("../lib/prepare-file-object");
var watch           = require("gulp-watch");

/**
 * Compiles SCSS/SASS
 *
 * @param {string} glob         the glob to find the files
 * @param {boolean} isDebug     flag, whether this is the debug mode (will start a watcher)
 * @returns {Function}
 */
module.exports = function (glob, isDebug)
{
    var baseDir = getBaseDir(glob);

    return function ()
    {
        var pipe = function (files)
        {
            return files
                .pipe(plumber())
                .pipe(sass({
                    style:     "compressed",
                    sourcemap: isDebug
                }))
                .pipe(rename(prepareFileName(baseDir, "assets/scss", "public/css")))
                .pipe(gulp.dest("./"));
        };

        if (isDebug)
        {
            return watch({glob: glob}, pipe);
        }
        else
        {
            return pipe( gulp.src(glob) );
        }
    };
};
