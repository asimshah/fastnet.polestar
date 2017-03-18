/// <reference path="../package.d.ts" />
// Note: not sure if I will need Promise.thenReturn
// interface Promise {
//     thenReturn(value: any);
// }
var fastnet;
(function (fastnet) {
    (function () {
        document.addEventListener('DOMContentLoaded', function () {
            javascriptExtensions.addAll();
        });
    })();
    var AsyncForEach = (function () {
        function AsyncForEach() {
            this.user = null;
            this.array = null;
            this.process = null;
        }
        AsyncForEach.prototype.forEach = function (array, f, user) {
            var _this = this;
            this.array = array;
            this.process = f;
            this.user = user;
            return Promise.resolve(0).then(function (index) {
                _this.loop(index);
            });
        };
        AsyncForEach.prototype.loop = function (index) {
            var _this = this;
            if (index < this.array.length) {
                return this.process(index, this.array, this.user).then(function () {
                    setTimeout(function () { _this.loop(index + 1); }, 0);
                });
            }
        };
        return AsyncForEach;
    }());
    var javascriptExtensions = (function () {
        function javascriptExtensions() {
        }
        javascriptExtensions.addAll = function () {
            this.addArrayFind();
            this.addStringEndsWith();
            this.addStringEndsWith();
            this.addAsyncForEach();
            // Note: not sure if I will need Promise.thenReturn
            // this.addThenReturn();
            // this.addStringIsNullOrWhitespace();
        };
        // private static addStringIsNullOrWhitespace() {
        //     if (!String.prototype.isNullOrWhitespace) {
        //         String.prototype.isNullOrWhitespace = function () {
        //             return !this || !this.trim();
        //         }
        //     }
        // }
        javascriptExtensions.addAsyncForEach = function () {
            if (!Array.prototype.asyncForEach) {
                Array.prototype.asyncForEach = function (f, user) {
                    var array = Object(this);
                    var afe = new AsyncForEach();
                    return afe.forEach(array, f, user);
                };
            }
        };
        // Note: not sure if I will need Promise.thenReturn
        // private static addThenReturn() {
        //     Promise.prototype.thenReturn = function (value) {
        //         return this.then(function () {
        //             return value;
        //         });
        //     };
        // }
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