"use strict";

/**
 * Task for handling the publishing of assets (either using symlink or copying)
 */

var wrench = require("wrench");
var fs     = require("fs");


/**
 * Removes the existing directory
 */
function removeExisting ()
{
    if (fs.existsSync("web/assets"))
    {
        var stat = fs.lstatSync("web/assets");

        if (stat.isFile() || stat.isSymbolicLink())
        {
            fs.unlinkSync("web/assets");
        }
        else
        {
            wrench.rmdirSyncRecursive("web/assets");
        }
    }
}


module.exports = {
    /**
     * Symlinks the assets directory
     */
    symlink: function ()
    {
        removeExisting();

        fs.symlinkSync("../public", "web/assets");
    },


    /**
     * Copies the assets directory
     */
    copy: function ()
    {
        removeExisting();

        wrench.copyDirSyncRecursive("public", "web/assets", {
            forceDelete: true
        });
    }
};
