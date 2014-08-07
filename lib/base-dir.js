/**
 * Returns the base dir by a glob
 *
 * @param {string} glob
 * @returns {string}
 */
module.exports = function (glob)
{
    var baseDir = (-1 < glob.indexOf("*")) ? glob.slice(0, glob.indexOf("*")) : glob;

    if (!baseDir)
    {
        return "";
    }

    // ensure trailing slash
    return baseDir.replace(/\/*$/, "") + "/";
};
