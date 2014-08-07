/**
 * Returns the function which prepares the filename
 *
 * @param {string} baseDir
 * @param {string} find
 * @param {string} replace
 * @returns {Function}
 */
module.exports = function (path, find, replace)
{
    var regexFind = new RegExp("(\/|^)" + find);
    var regexReplace = "$1" + replace;

    return path.replace(regexFind, regexReplace);
};
