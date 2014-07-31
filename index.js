var gulp    = require("gulp");
var uglify  = require("gulp-uglify");
var sass    = require("gulp-ruby-sass");
var watch   = require("gulp-watch");
var rename  = require("gulp-rename");
var plumber = require("gulp-plumber");


/**
 * Returns the base dir by a glob
 *
 * @param {string} glob
 * @returns {string}
 */
function getBaseDir (glob)
{
    var baseDir = (-1 < glob.indexOf("*")) ? glob.slice(0, glob.indexOf("*")) : glob;

    if (!baseDir)
    {
        return "";
    }

    // ensure trailing slash
    return baseDir.replace(/\/*$/, "") + "/";
}

/**
 * Returns the function which prepares the filename
 *
 * @param {string} baseDir
 * @param {string} find
 * @param {string} replace
 * @returns {Function}
 */
function prepareFileName (baseDir, find, replace)
{
    return function (path)
    {
        if ("." === path.dirname)
        {
            path.dirname = "";
        }

        var regexFind = new RegExp("(\/|^)" + find);
        var regexReplace = "$1" + replace;

        path.dirname = baseDir + path.dirname;
        path.dirname = path.dirname.replace(regexFind, regexReplace);
    };
}


exports.scss = function (glob, isDebug)
{
    var baseDir = getBaseDir(glob);

    return function ()
    {
        var pipe = function (files)
        {
            return files
                .pipe(plumber())
                .pipe(sass({
                    style: "compressed"
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


exports.js = function (glob, outputDir, isDebug)
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
