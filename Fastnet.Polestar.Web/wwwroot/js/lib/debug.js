var fastnet;
(function (fastnet) {
    var debug = (function () {
        function debug() {
        }
        debug.print = function (message) {
            if (debug.routeMessagesToVisualStudio) {
                if (window.hasOwnProperty('Debug')) {
                    var x = window['Debug'];
                    x.writeln("[browser] " + message);
                }
                else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        };
        debug.routeMessagesToVisualStudio = true;
        return debug;
    }());
    fastnet.debug = debug;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=debug.js.map