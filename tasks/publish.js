var wrench = require("wrench");
var fs     = require("fs");


module.exports = {
    /**
     * Symlinks the assets directory
     */
    symlink: function ()
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

        fs.symlinkSync("../public", "web/assets");
    },

    /**
     * Copies the assets directory
     */
    copy: function ()
    {
        wrench.copyDirSyncRecursive("public", "web/assets", {
            forceDelete: true
        });
    }
};
