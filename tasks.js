/**
 * Exports the complete interface
 */
module.exports = {
    js:        require("./tasks/js_bundle"),
    js_simple: require("./tasks/js_simple"),
    scss:      require("./tasks/sass"),
    layout:    require("./tasks/layout"),
    jshint:    require("./tasks/jshint"),
    publish:   require("./tasks/publish")
};
