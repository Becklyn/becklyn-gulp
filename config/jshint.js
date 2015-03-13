"use strict";

var xtend = require("xtend");

module.exports = {
    /**
     * Returns the rules
     *
     * @param {{}} [overwrite]
     * @returns {{}}
     */
    getRules: function (overwrite)
    {
        overwrite = overwrite || {};
        return xtend(this.rules, overwrite);
    },

    /**
     * The predefined rules
     *
     * @private
     * @type {{}}
     */
    rules: {
        //enforce
        bitwise: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        freeze: true,
        funcscope: true,
        futurehostile: true,
        globalstrict: true,
        latedef: true,
        maxdepth: 5,
        maxparams: 3,
        noarg: true,
        nocomma: true,
        nonbsp: true,
        nonew: true,
        singleGroups: true,
        undef: true,
        unused: true,

        // relaxation
        eqnull: true,
        strict: true,

        // environments
        browser: true,
        browserify: true,
        jquery: true
    }
};
