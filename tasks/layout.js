var fs     = require("fs");
var path   = require("path");
var gutil  = require("gulp-util");
var wrench = require("wrench");


/**
 * Copies a layout directory to a project
 *
 * @param {string} layoutDir                                    the path where the layout files are located
 * @param {string} vendorDir                                    the path where the layout files should be copied to
 * @param {Array.<{from: string, to: string}>} copyMapping      the relative paths to copy from/to
 */
module.exports = function (layoutDir, vendorDir, copyMapping)
{
    // check that input dir exists
    if (!fs.existsSync(layoutDir))
    {
        gutil.log(gutil.colors.red("Layout: layout directory does not exist, it needs to be located at ") + layoutDir);
        return;
    }

    for (var i = 0; i < copyMapping.length; i++)
    {
        var from = layoutDir + copyMapping[i].from;
        var to   = vendorDir + copyMapping[i].to;

        wrench.mkdirSyncRecursive(path.dirname( to ));

        wrench.copyDirRecursive(
            from,
            to,
            {
                forceDelete: true
            },
            function (err) {
                if (err) gutil.log(err);
            }
        );
    }
};
