/// <reference path="../package.d.ts" />
interface Array<T> {
    find(predicate: (search: T) => boolean): T;
    asyncForEach(f: (i: number, array: any[], user: any) => Promise<void>, user: any): Promise<void>;
}
interface String {
    endsWith(searchString: string, position?: number);
    startsWith(searchString: string, position?: number);
    //isNullOrWhitespace(): boolean; // REMOVE THIS AS IT CANNOT DO A NULL TEST!!
}
// Note: not sure if I will need Promise.thenReturn
// interface Promise {
//     thenReturn(value: any);
// }
namespace fastnet {
    (() => {
        document.addEventListener('DOMContentLoaded', function () {
            javascriptExtensions.addAll();
        });
    })();
    class AsyncForEach {
        private user: any = null;
        private array: any[] = null;
        private process: (i: number, array: any[], user: any) => Promise<void> = null;
        public forEach(array: any[], f: (i: number, array: any[], user: any) => Promise<void>, user: any): Promise<void> {
            this.array = array;
            this.process = f;
            this.user = user;
            return Promise.resolve(0).then((index) => {
                this.loop(index);
            });
        }
        private loop(index: number): Promise<void> {
            if (index < this.array.length) {
                return this.process(index, this.array, this.user).then(() => {
                    setTimeout(() => { this.loop(index + 1) }, 0);
                });
            }
        }
    }
    export class javascriptExtensions {
        public static addAll() {
            this.addArrayFind();
            this.addStringEndsWith();
            this.addStringEndsWith();
            this.addAsyncForEach();
            // Note: not sure if I will need Promise.thenReturn
            // this.addThenReturn();
            // this.addStringIsNullOrWhitespace();
        }
        // private static addStringIsNullOrWhitespace() {
        //     if (!String.prototype.isNullOrWhitespace) {
        //         String.prototype.isNullOrWhitespace = function () {
        //             return !this || !this.trim();
        //         }
        //     }
        // }
        private static addAsyncForEach() {
            if (!Array.prototype.asyncForEach) {
                Array.prototype.asyncForEach = function (f, user): Promise<void> {
                    var array = Object(this);
                    var afe = new AsyncForEach();
                    return afe.forEach(array, f, user);
                }
            }
        }
        // Note: not sure if I will need Promise.thenReturn
        // private static addThenReturn() {
        //     Promise.prototype.thenReturn = function (value) {
        //         return this.then(function () {
        //             return value;
        //         });
        //     };
        // }
        private static addStringStartsWith() {
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.substr(position, searchString.length) === searchString;
                };
            }
        }
        private static addStringEndsWith() {
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
        }
        private static addArrayFind() {
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
        }
    }
    export class f$ {
        public static isUndefinedOrNull(obj: any): boolean {
            return obj === undefined || obj === null;
        }
    }
}