var gulp            = require("gulp");
var uglify          = require("gulp-uglify");
var prepareFilePath = require("../lib/prepare-file-path");
var watchify        = require('watchify');
var browserify      = require("browserify");
var globResolver    = require("glob");
var getBaseDir      = require("../lib/base-dir");
var path            = require("path");
var fireworm        = require("fireworm");
var source          = require('vinyl-source-stream');
var gutil           = require("gulp-util");
var gulpif          = require("gulp-if");
var streamify       = require("gulp-streamify");


/**
 * Runs the browserify task
 *
 *
 * @param {string} inputFileName
 * @param {string} outputFileName
 * @param {string} isDebug
 */
function browserifyFile (inputFileName, outputFileName, isDebug)
{
    return browserify("./" + inputFileName, {debug: isDebug})
        .bundle()
        .pipe(source( path.basename(outputFileName) ))
        .pipe(gulpif(!isDebug, streamify(uglify({
            compress: true
        }))))
        .pipe(gulp.dest( path.dirname(outputFileName) ));
}

/**
 * Watchifies the input files
 *
 * @param {string} inputFileName    The base dir to the
 * @param {string} outputFileName   The file path to the file to compile
 * @param {boolean} isDebug         Flag, whether the debug mode is on
 */
function watchifyFile (inputFileName, outputFileName, isDebug)
{
    var browserifyOptions   = watchify.args;
    browserifyOptions.debug = isDebug;
    var bundler             = watchify(browserify("./" + inputFileName, browserifyOptions));

    bundler.on("update",
        function ()
        {
            gutil.log(gutil.colors.cyan("watchify update:") , inputFileName);

            return bundler.bundle()
                .on('error', function(e) {
                    gutil.log(gutil.colors.red('Browserify Error:'), e.message);
                })
                .pipe(source( path.basename(outputFileName) ))
                .pipe(gulpif(!isDebug, streamify(uglify({
                    compress: true
                }))))
                .pipe(gulp.dest( path.dirname(outputFileName) ));
        }
    );

    return bundler;
}


/**
 * Directly compiles the files in the glob
 *
 * @param {string} baseDir                              the base dir to the javascript files
 * @param {function(string)} outputFilePathGenerator    the function which generates the output path from the input path
 * @param {boolean} isDebug                             the flag, whether it should be compiled in debug mode
 */
function directlyCompile(baseDir, outputFilePathGenerator, isDebug)
{
    var files = globResolver.sync(baseDir + "/*.js");

    if (files)
    {
        files.forEach(
            function (inputFileName)
            {
                var outputFileName = outputFilePathGenerator(inputFileName);
                browserifyFile(inputFileName, outputFileName, isDebug);
            }
        );
    }
}



/**
 * Watches for changes in the directory
 *
 * @param {string} baseDir                              the base dir to the javascript files
 * @param {function(string)} outputFilePathGenerator    the function to generate the output file name
 * @param {boolean} isDebug                             flag, whether this is the debug mode
 */
function watchForChanges (baseDir, outputFilePathGenerator, isDebug)
{
    var fw = fireworm(baseDir, {
        ignoreInitial: true
    });
    var watches = [];
    fw.add("**/*.js");

    // list on change events (only add and remove - change will be picked up by watchify)
//    fw.on("add",    function () { gutil.log("javascript file added, watchify restarted.");   watches = refreshWatchify(watches, baseDir, outputFilePathGenerator, isDebug); });
//    fw.on("remove", function () { gutil.log("javascript file removed, watchify restarted."); watches = refreshWatchify(watches, baseDir, outputFilePathGenerator, isDebug); });

    // initialize watchify
    watches = refreshWatchify(watches, baseDir, outputFilePathGenerator, isDebug);
}


/**
 *
 * @param {Array.<watchify>} previousWatches            the previously active watches
 * @param {string} baseDir                              the base dir to the javascript files
 * @param {boolean} isDebug                             flag, whether this is the debug mode
 * @param {function(string)} outputFilePathGenerator    the function to generate the output file name
 * @returns {Array.<watchify>}                          the list of newly created watches
 */
function refreshWatchify (previousWatches, baseDir, outputFilePathGenerator, isDebug)
{
    // close previous watches
    previousWatches.forEach(
        function (bundler)
        {
            bundler.close();
        }
    );

    // create new watches
    var files = globResolver.sync(baseDir + "/*.js");
    var watches = [];

    if (files)
    {
        files.forEach(
            function (inputFileName)
            {
                var outputFileName = outputFilePathGenerator(inputFileName);
                watches.push( watchifyFile(inputFileName, outputFileName, isDebug) );
            }
        );
    }

    return watches;
}


/**
 * This will compile files directly in baseDir via browserify - everything in subdirectories is assumed to be libraries (which won't be compiled directly)
 *
 * @param {string} baseDir      the base dir to the javascript files
 * @param {boolean} isDebug     flag, whether this is the debug mode (will start a watcher)
 * @returns {Function}
 */
module.exports = function (baseDir, isDebug)
{
    var outputFilePathGenerator = function (filePath) {
        return prepareFilePath(filePath, "assets/js", "public/js");
    };

    if (isDebug)
    {
        watchForChanges(baseDir, outputFilePathGenerator, isDebug);
    }
    else
    {
        directlyCompile(baseDir, outputFilePathGenerator, isDebug);
    }
};
