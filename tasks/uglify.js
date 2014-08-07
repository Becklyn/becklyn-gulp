var gulp            = require("gulp");
var getBaseDir      = require("../lib/base-dir");
var plumber         = require("gulp-plumber");
var uglify          = require("gulp-uglify");
var rename          = require("gulp-rename");
var prepareFileName = require("../lib/prepare-file-object");
var watch           = require("gulp-watch");


/**
 * Compiles JavaScript using uglifyjs
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
        var pipe = function (files) {
            return files
                .pipe(plumber())
                .pipe(uglify({
                    compressed: true
                }))
                .pipe(rename(prepareFileName(baseDir, "assets/js", "public/js")))
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
