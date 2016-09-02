(function() {

    // top level block isn't indented
    var x = 123;

    setTimeout(function() {
        x();
    });

}());

// don't mess up other code outside a function scope
var x = {
    abc: 123
};

module.exports = function() {

    var x = 123;

};

(function( factory ) {
    if ( typeof define === "function" && define.amd ) {
        // AMD. Register as an anonymous module.
        define([
            "jquery",
            "./core",
            "./widget"
        ], factory );
    } else {
        // Browser globals
        factory( jQuery );
    }
}(function( $ ) {
    return $.widget( "ui.accordion", {
        version: "@VERSION",
        options: {}
    });
}));
