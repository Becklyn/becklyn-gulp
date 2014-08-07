/**
 * Exports the complete interface
 */
module.exports = {
    scss:       require("./tasks/sass"),
    js:         require("./tasks/uglify"),
    layout:     require("./tasks/layout"),
    browserify: require("./tasks/browserify"),
    jshint:     require("./tasks/jshint")
};
