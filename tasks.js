/**
 * Exports the complete interface
 */
module.exports = {
    js:        require("./tasks/js_bundle"),
    js_simple: require("./tasks/js_simple"),
    scss:      require("./tasks/scss"),
    jshint:    require("./tasks/jshint"),
    layout:    require("./tasks/layout"),
    publish:   require("./tasks/publish"),

    // pass our gulp version out
    gulp: require("gulp")
};
