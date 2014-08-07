var prepareFilePath = require("./prepare-file-path");

/**
 * Returns the function which prepares the filename
 *
 * @param {string} baseDir
 * @param {string} find
 * @param {string} replace
 * @returns {Function}
 */
module.exports = function (baseDir, find, replace)
{
    return function (path)
    {
        if ("." === path.dirname)
        {
            path.dirname = "";
        }

        path.dirname = baseDir + path.dirname;
        path.dirname = prepareFilePath(path.dirname, find, replace);
    };
};
