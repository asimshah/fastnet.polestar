var fastnet;
(function (fastnet) {
    (function () {
        document.addEventListener('DOMContentLoaded', function () {
            javascriptExtensions.addAll();
        });
    })();
    var javascriptExtensions = (function () {
        function javascriptExtensions() {
        }
        javascriptExtensions.addAll = function () {
            this.addArrayFind();
            this.addStringEndsWith();
            this.addStringEndsWith();
        };
        javascriptExtensions.addStringStartsWith = function () {
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.substr(position, searchString.length) === searchString;
                };
            }
        };
        javascriptExtensions.addStringEndsWith = function () {
            if (!String.prototype.endsWith) {
                String.prototype.endsWith = function (searchString, position) {
                    var subjectString = this.toString();
                    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
                        position = subjectString.length;
                    }
                    position -= searchString.length;
                    var lastIndex = subjectString.indexOf(searchString, position);
                    return lastIndex !== -1 && lastIndex === position;
                };
            }
        };
        javascriptExtensions.addArrayFind = function () {
            if (!Array.prototype.find) {
                Array.prototype.find = function (predicate) {
                    if (this == null) {
                        throw new TypeError('Array.prototype.find called on null or undefined');
                    }
                    if (typeof predicate !== 'function') {
                        throw new TypeError('predicate must be a function');
                    }
                    var list = Object(this);
                    var length = list.length >>> 0;
                    var thisArg = arguments[1];
                    var value;
                    for (var i = 0; i < length; i++) {
                        value = list[i];
                        if (predicate.call(thisArg, value, i, list)) {
                            return value;
                        }
                    }
                    return null;
                };
            }
        };
        return javascriptExtensions;
    }());
    fastnet.javascriptExtensions = javascriptExtensions;
    var f$ = (function () {
        function f$() {
        }
        f$.isUndefinedOrNull = function (obj) {
            return obj === undefined || obj === null;
        };
        return f$;
    }());
    fastnet.f$ = f$;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=javascriptExtensions.js.map