"use strict";

var gulp    = require("gulp");
var jshint  = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");
var gulpUtil = require("gulp-util");
var plumber = require("gulp-plumber");
var pathHelper = require("../lib/path-helper");
var jsHintConfigHelper = require("../config/jshint");
var xtend = require("xtend");


module.exports = {
    /**
     * Lints a given file
     *
     * @param {string} filePath
     * @param {{esnext: boolean}} [options]
     */
    lintFile: function (filePath, options)
    {
        gulpUtil.log(gulpUtil.colors.blue("jsHint"), pathHelper.makeRelative(filePath));

        var jsHintConfig = jsHintConfigHelper.getRules(xtend({
            lookup: false,
            esnext: false
        }, options));

        gulp.src(filePath)
            .pipe(plumber())
            .pipe(jshint(jsHintConfig))
            .pipe(jshint.reporter(jshintStylish));
    }
};
