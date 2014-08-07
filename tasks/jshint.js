var gulp    = require("gulp");
var plumber = require("gulp-plumber");
var jshint  = require("gulp-jshint");


/**
 * Runs JSHint
 *
 * @param {string} glob         the glob to find the files
 * @param {boolean} isDebug     flag, whether this is the debug mode (will start a watcher)
 * @returns {Function}
 */
module.exports = function (glob, isDebug)
{
    var pipe = function (pipe)
    {
        return pipe
            .pipe(plumber())
            .pipe(jshint({
                lookup: true
            }))
            .pipe(jshint.reporter('jshint-stylish'));
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
