"use strict";

var path = require("path");


module.exports = {
    isRootFile: function (filePath)
    {
        return 0 !== path.basename(filePath).indexOf("_");
    }
};
