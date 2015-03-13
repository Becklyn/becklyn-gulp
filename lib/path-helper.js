"use strict";

var path = require("path");


module.exports = {
    /**
     * Makes the file path relative
     *
     * @param {string} filePath
     * @returns {string}
     */
    makeRelative: function (filePath)
    {
        if (0 === filePath.indexOf(process.cwd()))
        {
            filePath = path.relative(process.cwd(), filePath);
        }

        if (0 !== filePath.indexOf("./") && 0 !== filePath.indexOf("/"))
        {
            filePath = "./" + filePath;
        }

        return filePath;
    }
};
