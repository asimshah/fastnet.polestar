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
        };
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
var fastnet;
(function (fastnet) {
    var busyIndicator = (function () {
        function busyIndicator() {
            this.overlay = "<div class='block-overlay'>                        \n            <div class='indicator'>\n                <div class='message'></div>\n                <div class='animation'><i class=\"fa fa-gear fa-spin fa-3x\"></i></div>\n            </div>\n         </div>";
        }
        busyIndicator.prototype.block = function (message) {
            if (!busyIndicator.isBlocked) {
                var overlayElement = document.createElement("div");
                overlayElement.innerHTML = this.overlay;
                document.body.appendChild(overlayElement);
                if (message !== undefined) {
                    var nodes = overlayElement.getElementsByClassName("message");
                    nodes.item(0).innerHTML = message;
                }
                busyIndicator.isBlocked = true;
            }
        };
        busyIndicator.prototype.unBlock = function () {
            var overlayParent = document.querySelector(".block-overlay").parentElement;
            overlayParent.parentElement.removeChild(overlayParent);
            busyIndicator.isBlocked = false;
        };
        busyIndicator.isBlocked = false;
        return busyIndicator;
    }());
    fastnet.busyIndicator = busyIndicator;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=busyIndicator.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Copyright 2013 Basarat Ali Syed. All Rights Reserved.
//
// Licensed under MIT open source license http://opensource.org/licenses/MIT
//
// Orginal javascript code was by Mauricio Santos
// asim
/**
 * @namespace Top level namespace for collections, a TypeScript data structure library.
 */
var collections;
(function (collections) {
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var has = function (obj, prop) {
        return _hasOwnProperty.call(obj, prop);
    };
    /**
     * Default function to compare element order.
     * @function
     */
    function defaultCompare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a === b) {
            return 0;
        }
        else {
            return 1;
        }
    }
    collections.defaultCompare = defaultCompare;
    /**
     * Default function to test equality.
     * @function
     */
    function defaultEquals(a, b) {
        return a === b;
    }
    collections.defaultEquals = defaultEquals;
    /**
     * Default function to convert an object to a string.
     * @function
     */
    function defaultToString(item) {
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return '$s' + item;
        }
        else {
            return '$o' + item.toString();
        }
    }
    collections.defaultToString = defaultToString;
    /**
    * Joins all the properies of the object using the provided join string
    */
    function makeString(item, join) {
        if (join === void 0) { join = ","; }
        if (item === null) {
            return 'COLLECTION_NULL';
        }
        else if (collections.isUndefined(item)) {
            return 'COLLECTION_UNDEFINED';
        }
        else if (collections.isString(item)) {
            return item.toString();
        }
        else {
            var toret = "{";
            var first = true;
            for (var prop in item) {
                if (has(item, prop)) {
                    if (first)
                        first = false;
                    else
                        toret = toret + join;
                    toret = toret + prop + ":" + item[prop];
                }
            }
            return toret + "}";
        }
    }
    collections.makeString = makeString;
    /**
     * Checks if the given argument is a function.
     * @function
     */
    function isFunction(func) {
        return (typeof func) === 'function';
    }
    collections.isFunction = isFunction;
    /**
     * Checks if the given argument is undefined.
     * @function
     */
    function isUndefined(obj) {
        return (typeof obj) === 'undefined';
    }
    collections.isUndefined = isUndefined;
    /**
     * Checks if the given argument is a string.
     * @function
     */
    function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }
    collections.isString = isString;
    /**
     * Reverses a compare function.
     * @function
     */
    function reverseCompareFunction(compareFunction) {
        if (!collections.isFunction(compareFunction)) {
            return function (a, b) {
                if (a < b) {
                    return 1;
                }
                else if (a === b) {
                    return 0;
                }
                else {
                    return -1;
                }
            };
        }
        else {
            return function (d, v) {
                return compareFunction(d, v) * -1;
            };
        }
    }
    collections.reverseCompareFunction = reverseCompareFunction;
    /**
     * Returns an equal function given a compare function.
     * @function
     */
    function compareToEquals(compareFunction) {
        return function (a, b) {
            return compareFunction(a, b) === 0;
        };
    }
    collections.compareToEquals = compareToEquals;
    /**
     * @namespace Contains various functions for manipulating arrays.
     */
    var arrays;
    (function (arrays) {
        /**
         * Returns the position of the first occurrence of the specified item
         * within the specified array.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the first occurrence of the specified element
         * within the specified array, or -1 if not found.
         */
        function indexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.indexOf = indexOf;
        /**
         * Returns the position of the last occurrence of the specified element
         * within the specified array.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the position of the last occurrence of the specified element
         * within the specified array or -1 if not found.
         */
        function lastIndexOf(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            for (var i = length - 1; i >= 0; i--) {
                if (equals(array[i], item)) {
                    return i;
                }
            }
            return -1;
        }
        arrays.lastIndexOf = lastIndexOf;
        /**
         * Returns true if the specified array contains the specified element.
         * @param {*} array the array in which to search the element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the specified array contains the specified element.
         */
        function contains(array, item, equalsFunction) {
            return arrays.indexOf(array, item, equalsFunction) >= 0;
        }
        arrays.contains = contains;
        /**
         * Removes the first ocurrence of the specified element from the specified array.
         * @param {*} array the array in which to search element.
         * @param {Object} item the element to search.
         * @param {function(Object,Object):boolean=} equalsFunction optional function to
         * check equality between 2 elements.
         * @return {boolean} true if the array changed after this call.
         */
        function remove(array, item, equalsFunction) {
            var index = arrays.indexOf(array, item, equalsFunction);
            if (index < 0) {
                return false;
            }
            array.splice(index, 1);
            return true;
        }
        arrays.remove = remove;
        /**
         * Returns the number of elements in the specified array equal
         * to the specified object.
         * @param {Array} array the array in which to determine the frequency of the element.
         * @param {Object} item the element whose frequency is to be determined.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between 2 elements.
         * @return {number} the number of elements in the specified array
         * equal to the specified object.
         */
        function frequency(array, item, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            var length = array.length;
            var freq = 0;
            for (var i = 0; i < length; i++) {
                if (equals(array[i], item)) {
                    freq++;
                }
            }
            return freq;
        }
        arrays.frequency = frequency;
        /**
         * Returns true if the two specified arrays are equal to one another.
         * Two arrays are considered equal if both arrays contain the same number
         * of elements, and all corresponding pairs of elements in the two
         * arrays are equal and are in the same order.
         * @param {Array} array1 one array to be tested for equality.
         * @param {Array} array2 the other array to be tested for equality.
         * @param {function(Object,Object):boolean=} equalsFunction optional function used to
         * check equality between elemements in the arrays.
         * @return {boolean} true if the two arrays are equal
         */
        function equals(array1, array2, equalsFunction) {
            var equals = equalsFunction || collections.defaultEquals;
            if (array1.length !== array2.length) {
                return false;
            }
            var length = array1.length;
            for (var i = 0; i < length; i++) {
                if (!equals(array1[i], array2[i])) {
                    return false;
                }
            }
            return true;
        }
        arrays.equals = equals;
        /**
         * Returns shallow a copy of the specified array.
         * @param {*} array the array to copy.
         * @return {Array} a copy of the specified array
         */
        function copy(array) {
            return array.concat();
        }
        arrays.copy = copy;
        /**
         * Swaps the elements at the specified positions in the specified array.
         * @param {Array} array The array in which to swap elements.
         * @param {number} i the index of one element to be swapped.
         * @param {number} j the index of the other element to be swapped.
         * @return {boolean} true if the array is defined and the indexes are valid.
         */
        function swap(array, i, j) {
            if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
                return false;
            }
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            return true;
        }
        arrays.swap = swap;
        function toString(array) {
            return '[' + array.toString() + ']';
        }
        arrays.toString = toString;
        /**
         * Executes the provided function once for each element present in this array
         * starting from index 0 to length - 1.
         * @param {Array} array The array in which to iterate.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        function forEach(array, callback) {
            var lenght = array.length;
            for (var i = 0; i < lenght; i++) {
                if (callback(array[i]) === false) {
                    return;
                }
            }
        }
        arrays.forEach = forEach;
    })(arrays = collections.arrays || (collections.arrays = {}));
    var LinkedList = (function () {
        /**
        * Creates an empty Linked List.
        * @class A linked list is a data structure consisting of a group of nodes
        * which together represent a sequence.
        * @constructor
        */
        function LinkedList() {
            /**
            * First node in the list
            * @type {Object}
            * @private
            */
            this.firstNode = null;
            /**
            * Last node in the list
            * @type {Object}
            * @private
            */
            this.lastNode = null;
            /**
            * Number of elements in the list
            * @type {number}
            * @private
            */
            this.nElements = 0;
        }
        /**
        * Adds an element to this list.
        * @param {Object} item element to be added.
        * @param {number=} index optional index to add the element. If no index is specified
        * the element is added to the end of this list.
        * @return {boolean} true if the element was added or false if the index is invalid
        * or if the element is undefined.
        */
        LinkedList.prototype.add = function (item, index) {
            if (collections.isUndefined(index)) {
                index = this.nElements;
            }
            if (index < 0 || index > this.nElements || collections.isUndefined(item)) {
                return false;
            }
            var newNode = this.createNode(item);
            if (this.nElements === 0) {
                // First node in the list.
                this.firstNode = newNode;
                this.lastNode = newNode;
            }
            else if (index === this.nElements) {
                // Insert at the end.
                this.lastNode.next = newNode;
                this.lastNode = newNode;
            }
            else if (index === 0) {
                // Change first node.
                newNode.next = this.firstNode;
                this.firstNode = newNode;
            }
            else {
                var prev = this.nodeAtIndex(index - 1);
                newNode.next = prev.next;
                prev.next = newNode;
            }
            this.nElements++;
            return true;
        };
        /**
        * Returns the first element in this list.
        * @return {*} the first element of the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.first = function () {
            if (this.firstNode !== null) {
                return this.firstNode.element;
            }
            return undefined;
        };
        /**
        * Returns the last element in this list.
        * @return {*} the last element in the list or undefined if the list is
        * empty.
        */
        LinkedList.prototype.last = function () {
            if (this.lastNode !== null) {
                return this.lastNode.element;
            }
            return undefined;
        };
        /**
         * Returns the element at the specified position in this list.
         * @param {number} index desired index.
         * @return {*} the element at the given index or undefined if the index is
         * out of bounds.
         */
        LinkedList.prototype.elementAtIndex = function (index) {
            var node = this.nodeAtIndex(index);
            if (node === null) {
                return undefined;
            }
            return node.element;
        };
        /**
         * Returns the index in this list of the first occurrence of the
         * specified element, or -1 if the List does not contain this element.
         * <p>If the elements inside this list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction Optional
         * function used to check if two elements are equal.
         * @return {number} the index in this list of the first occurrence
         * of the specified element, or -1 if this list does not contain the
         * element.
         */
        LinkedList.prototype.indexOf = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (collections.isUndefined(item)) {
                return -1;
            }
            var currentNode = this.firstNode;
            var index = 0;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    return index;
                }
                index++;
                currentNode = currentNode.next;
            }
            return -1;
        };
        /**
           * Returns true if this list contains the specified element.
           * <p>If the elements inside the list are
           * not comparable with the === operator a custom equals function should be
           * provided to perform searches, the function must receive two arguments and
           * return true if they are equal, false otherwise. Example:</p>
           *
           * <pre>
           * var petsAreEqualByName = function(pet1, pet2) {
           *  return pet1.name === pet2.name;
           * }
           * </pre>
           * @param {Object} item element to search for.
           * @param {function(Object,Object):boolean=} equalsFunction Optional
           * function used to check if two elements are equal.
           * @return {boolean} true if this list contains the specified element, false
           * otherwise.
           */
        LinkedList.prototype.contains = function (item, equalsFunction) {
            return (this.indexOf(item, equalsFunction) >= 0);
        };
        /**
         * Removes the first occurrence of the specified element in this list.
         * <p>If the elements inside the list are
         * not comparable with the === operator a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName = function(pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} item element to be removed from this list, if present.
         * @return {boolean} true if the list contained the specified element.
         */
        LinkedList.prototype.remove = function (item, equalsFunction) {
            var equalsF = equalsFunction || collections.defaultEquals;
            if (this.nElements < 1 || collections.isUndefined(item)) {
                return false;
            }
            var previous = null;
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (equalsF(currentNode.element, item)) {
                    if (currentNode === this.firstNode) {
                        this.firstNode = this.firstNode.next;
                        if (currentNode === this.lastNode) {
                            this.lastNode = null;
                        }
                    }
                    else if (currentNode === this.lastNode) {
                        this.lastNode = previous;
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    else {
                        previous.next = currentNode.next;
                        currentNode.next = null;
                    }
                    this.nElements--;
                    return true;
                }
                previous = currentNode;
                currentNode = currentNode.next;
            }
            return false;
        };
        /**
         * Removes all of the elements from this list.
         */
        LinkedList.prototype.clear = function () {
            this.firstNode = null;
            this.lastNode = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this list is equal to the given list.
         * Two lists are equal if they have the same elements in the same order.
         * @param {LinkedList} other the other list.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function used to check if two elements are equal. If the elements in the lists
         * are custom objects you should provide a function, otherwise
         * the === operator is used to check equality between elements.
         * @return {boolean} true if this list is equal to the given list.
         */
        LinkedList.prototype.equals = function (other, equalsFunction) {
            var eqF = equalsFunction || collections.defaultEquals;
            if (!(other instanceof collections.LinkedList)) {
                return false;
            }
            if (this.size() !== other.size()) {
                return false;
            }
            return this.equalsAux(this.firstNode, other.firstNode, eqF);
        };
        /**
        * @private
        */
        LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
            while (n1 !== null) {
                if (!eqF(n1.element, n2.element)) {
                    return false;
                }
                n1 = n1.next;
                n2 = n2.next;
            }
            return true;
        };
        /**
         * Removes the element at the specified position in this list.
         * @param {number} index given index.
         * @return {*} removed element or undefined if the index is out of bounds.
         */
        LinkedList.prototype.removeElementAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return undefined;
            }
            var element;
            if (this.nElements === 1) {
                //First node in the list.
                element = this.firstNode.element;
                this.firstNode = null;
                this.lastNode = null;
            }
            else {
                var previous = this.nodeAtIndex(index - 1);
                if (previous === null) {
                    element = this.firstNode.element;
                    this.firstNode = this.firstNode.next;
                }
                else if (previous.next === this.lastNode) {
                    element = this.lastNode.element;
                    this.lastNode = previous;
                }
                if (previous !== null) {
                    element = previous.next.element;
                    previous.next = previous.next.next;
                }
            }
            this.nElements--;
            return element;
        };
        /**
         * Executes the provided function once for each element present in this list in order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        LinkedList.prototype.forEach = function (callback) {
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                if (callback(currentNode.element) === false) {
                    break;
                }
                currentNode = currentNode.next;
            }
        };
        /**
         * Reverses the order of the elements in this linked list (makes the last
         * element first, and the first element last).
         */
        LinkedList.prototype.reverse = function () {
            var previous = null;
            var current = this.firstNode;
            var temp = null;
            while (current !== null) {
                temp = current.next;
                current.next = previous;
                previous = current;
                current = temp;
            }
            temp = this.firstNode;
            this.firstNode = this.lastNode;
            this.lastNode = temp;
        };
        /**
         * Returns an array containing all of the elements in this list in proper
         * sequence.
         * @return {Array.<*>} an array containing all of the elements in this list,
         * in proper sequence.
         */
        LinkedList.prototype.toArray = function () {
            var array = [];
            var currentNode = this.firstNode;
            while (currentNode !== null) {
                array.push(currentNode.element);
                currentNode = currentNode.next;
            }
            return array;
        };
        /**
         * Returns the number of elements in this list.
         * @return {number} the number of elements in this list.
         */
        LinkedList.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this list contains no elements.
         * @return {boolean} true if this list contains no elements.
         */
        LinkedList.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        LinkedList.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        /**
         * @private
         */
        LinkedList.prototype.nodeAtIndex = function (index) {
            if (index < 0 || index >= this.nElements) {
                return null;
            }
            if (index === (this.nElements - 1)) {
                return this.lastNode;
            }
            var node = this.firstNode;
            for (var i = 0; i < index; i++) {
                node = node.next;
            }
            return node;
        };
        /**
         * @private
         */
        LinkedList.prototype.createNode = function (item) {
            return {
                element: item,
                next: null
            };
        };
        return LinkedList;
    }());
    collections.LinkedList = LinkedList; // End of linked list 
    var Dictionary = (function () {
        /**
         * Creates an empty dictionary.
         * @class <p>Dictionaries map keys to values; each key can map to at most one value.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to unique
         * strings must be provided. Example:</p>
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         */
        function Dictionary(toStrFunction) {
            this.table = {};
            this.nElements = 0;
            this.toStr = toStrFunction || collections.defaultToString;
        }
        /**
         * Returns the value to which this dictionary maps the specified key.
         * Returns undefined if this dictionary contains no mapping for this key.
         * @param {Object} key key whose associated value is to be returned.
         * @return {*} the value to which this dictionary maps the specified key or
         * undefined if the map contains no mapping for this key.
         */
        Dictionary.prototype.getValue = function (key) {
            var pair = this.table['$' + this.toStr(key)];
            if (collections.isUndefined(pair)) {
                return undefined;
            }
            return pair.value;
        };
        /**
         * Associates the specified value with the specified key in this dictionary.
         * If the dictionary previously contained a mapping for this key, the old
         * value is replaced by the specified value.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value value to be associated with the specified key.
         * @return {*} previous value associated with the specified key, or undefined if
         * there was no mapping for the key or if the key/value are undefined.
         */
        Dictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return undefined;
            }
            var ret;
            var k = '$' + this.toStr(key);
            var previousElement = this.table[k];
            if (collections.isUndefined(previousElement)) {
                this.nElements++;
                ret = undefined;
            }
            else {
                ret = previousElement.value;
            }
            this.table[k] = {
                key: key,
                value: value
            };
            return ret;
        };
        /**
         * Removes the mapping for this key from this dictionary if it is present.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @return {*} previous value associated with specified key, or undefined if
         * there was no mapping for key.
         */
        Dictionary.prototype.remove = function (key) {
            var k = '$' + this.toStr(key);
            var previousElement = this.table[k];
            if (!collections.isUndefined(previousElement)) {
                delete this.table[k];
                this.nElements--;
                return previousElement.value;
            }
            return undefined;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        Dictionary.prototype.keys = function () {
            var array = [];
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    array.push(pair.key);
                }
            }
            return array;
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        Dictionary.prototype.values = function () {
            var array = [];
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    array.push(pair.value);
                }
            }
            return array;
        };
        /**
        * Executes the provided function once for each key-value pair
        * present in this dictionary.
        * @param {function(Object,Object):*} callback function to execute, it is
        * invoked with two arguments: key and value. To break the iteration you can
        * optionally return false.
        */
        Dictionary.prototype.forEach = function (callback) {
            for (var name in this.table) {
                if (has(this.table, name)) {
                    var pair = this.table[name];
                    var ret = callback(pair.key, pair.value);
                    if (ret === false) {
                        return;
                    }
                }
            }
        };
        /**
         * Returns true if this dictionary contains a mapping for the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary contains a mapping for the
         * specified key.
         */
        Dictionary.prototype.containsKey = function (key) {
            return !collections.isUndefined(this.getValue(key));
        };
        /**
        * Removes all mappings from this dictionary.
        * @this {collections.Dictionary}
        */
        Dictionary.prototype.clear = function () {
            this.table = {};
            this.nElements = 0;
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        Dictionary.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        Dictionary.prototype.isEmpty = function () {
            return this.nElements <= 0;
        };
        Dictionary.prototype.toString = function () {
            var toret = "{";
            this.forEach(function (k, v) {
                toret = toret + "\n\t" + k.toString() + " : " + v.toString();
            });
            return toret + "\n}";
        };
        return Dictionary;
    }());
    collections.Dictionary = Dictionary; // End of dictionary
    /**
     * This class is used by the LinkedDictionary Internally
     * Has to be a class, not an interface, because it needs to have
     * the 'unlink' function defined.
     */
    var LinkedDictionaryPair = (function () {
        function LinkedDictionaryPair(key, value) {
            this.key = key;
            this.value = value;
        }
        LinkedDictionaryPair.prototype.unlink = function () {
            this.prev.next = this.next;
            this.next.prev = this.prev;
        };
        return LinkedDictionaryPair;
    }());
    var LinkedDictionary = (function (_super) {
        __extends(LinkedDictionary, _super);
        function LinkedDictionary(toStrFunction) {
            _super.call(this, toStrFunction);
            this.head = new LinkedDictionaryPair(null, null);
            this.tail = new LinkedDictionaryPair(null, null);
            this.head.next = this.tail;
            this.tail.prev = this.head;
        }
        /**
         * Inserts the new node to the 'tail' of the list, updating the
         * neighbors, and moving 'this.tail' (the End of List indicator) that
         * to the end.
         */
        LinkedDictionary.prototype.appendToTail = function (entry) {
            var lastNode = this.tail.prev;
            lastNode.next = entry;
            entry.prev = lastNode;
            entry.next = this.tail;
            this.tail.prev = entry;
        };
        /**
         * Retrieves a linked dictionary from the table internally
         */
        LinkedDictionary.prototype.getLinkedDictionaryPair = function (key) {
            if (collections.isUndefined(key)) {
                return undefined;
            }
            var k = '$' + this.toStr(key);
            var pair = (this.table[k]);
            return pair;
        };
        /**
         * Returns the value to which this dictionary maps the specified key.
         * Returns undefined if this dictionary contains no mapping for this key.
         * @param {Object} key key whose associated value is to be returned.
         * @return {*} the value to which this dictionary maps the specified key or
         * undefined if the map contains no mapping for this key.
         */
        LinkedDictionary.prototype.getValue = function (key) {
            var pair = this.getLinkedDictionaryPair(key);
            if (!collections.isUndefined(pair)) {
                return pair.value;
            }
            return undefined;
        };
        /**
         * Removes the mapping for this key from this dictionary if it is present.
         * Also, if a value is present for this key, the entry is removed from the
         * insertion ordering.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @return {*} previous value associated with specified key, or undefined if
         * there was no mapping for key.
         */
        LinkedDictionary.prototype.remove = function (key) {
            var pair = this.getLinkedDictionaryPair(key);
            if (!collections.isUndefined(pair)) {
                _super.prototype.remove.call(this, key); // This will remove it from the table
                pair.unlink(); // This will unlink it from the chain
                return pair.value;
            }
            return undefined;
        };
        /**
        * Removes all mappings from this LinkedDictionary.
        * @this {collections.LinkedDictionary}
        */
        LinkedDictionary.prototype.clear = function () {
            _super.prototype.clear.call(this);
            this.head.next = this.tail;
            this.tail.prev = this.head;
        };
        /**
         * Internal function used when updating an existing KeyValue pair.
         * It places the new value indexed by key into the table, but maintains
         * its place in the linked ordering.
         */
        LinkedDictionary.prototype.replace = function (oldPair, newPair) {
            var k = '$' + this.toStr(newPair.key);
            // set the new Pair's links to existingPair's links
            newPair.next = oldPair.next;
            newPair.prev = oldPair.prev;
            // Delete Existing Pair from the table, unlink it from chain.
            // As a result, the nElements gets decremented by this operation
            this.remove(oldPair.key);
            // Link new Pair in place of where oldPair was,
            // by pointing the old pair's neighbors to it.
            newPair.prev.next = newPair;
            newPair.next.prev = newPair;
            this.table[k] = newPair;
            // To make up for the fact that the number of elements was decremented,
            // We need to increase it by one.
            ++this.nElements;
        };
        /**
         * Associates the specified value with the specified key in this dictionary.
         * If the dictionary previously contained a mapping for this key, the old
         * value is replaced by the specified value.
         * Updating of a key that already exists maintains its place in the
         * insertion order into the map.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value value to be associated with the specified key.
         * @return {*} previous value associated with the specified key, or undefined if
         * there was no mapping for the key or if the key/value are undefined.
         */
        LinkedDictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return undefined;
            }
            var existingPair = this.getLinkedDictionaryPair(key);
            var newPair = new LinkedDictionaryPair(key, value);
            var k = '$' + this.toStr(key);
            // If there is already an element for that key, we 
            // keep it's place in the LinkedList
            if (!collections.isUndefined(existingPair)) {
                this.replace(existingPair, newPair);
                return existingPair.value;
            }
            else {
                this.appendToTail(newPair);
                this.table[k] = newPair;
                ++this.nElements;
                return undefined;
            }
        };
        /**
         * Returns an array containing all of the keys in this LinkedDictionary, ordered
         * by insertion order.
         * @return {Array} an array containing all of the keys in this LinkedDictionary,
         * ordered by insertion order.
         */
        LinkedDictionary.prototype.keys = function () {
            var array = [];
            this.forEach(function (key, value) {
                array.push(key);
            });
            return array;
        };
        /**
         * Returns an array containing all of the values in this LinkedDictionary, ordered by
         * insertion order.
         * @return {Array} an array containing all of the values in this LinkedDictionary,
         * ordered by insertion order.
         */
        LinkedDictionary.prototype.values = function () {
            var array = [];
            this.forEach(function (key, value) {
                array.push(value);
            });
            return array;
        };
        /**
        * Executes the provided function once for each key-value pair
        * present in this LinkedDictionary. It is done in the order of insertion
        * into the LinkedDictionary
        * @param {function(Object,Object):*} callback function to execute, it is
        * invoked with two arguments: key and value. To break the iteration you can
        * optionally return false.
        */
        LinkedDictionary.prototype.forEach = function (callback) {
            var crawlNode = this.head.next;
            while (crawlNode.next != null) {
                var ret = callback(crawlNode.key, crawlNode.value);
                if (ret === false) {
                    return;
                }
                crawlNode = crawlNode.next;
            }
        };
        return LinkedDictionary;
    }(Dictionary));
    collections.LinkedDictionary = LinkedDictionary; // End of LinkedDictionary
    // /**
    //  * Returns true if this dictionary is equal to the given dictionary.
    //  * Two dictionaries are equal if they contain the same mappings.
    //  * @param {collections.Dictionary} other the other dictionary.
    //  * @param {function(Object,Object):boolean=} valuesEqualFunction optional
    //  * function used to check if two values are equal.
    //  * @return {boolean} true if this dictionary is equal to the given dictionary.
    //  */
    // collections.Dictionary.prototype.equals = function(other,valuesEqualFunction) {
    // 	var eqF = valuesEqualFunction || collections.defaultEquals;
    // 	if(!(other instanceof collections.Dictionary)){
    // 		return false;
    // 	}
    // 	if(this.size() !== other.size()){
    // 		return false;
    // 	}
    // 	return this.equalsAux(this.firstNode,other.firstNode,eqF);
    // }
    var MultiDictionary = (function () {
        /**
         * Creates an empty multi dictionary.
         * @class <p>A multi dictionary is a special kind of dictionary that holds
         * multiple values against each key. Setting a value into the dictionary will
         * add the value to an array at that key. Getting a key will return an array,
         * holding all the values set to that key.
         * You can configure to allow duplicates in the values.
         * This implementation accepts any kind of objects as keys.</p>
         *
         * <p>If the keys are custom objects a function which converts keys to strings must be
         * provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
           *  return pet.name;
           * }
         * </pre>
         * <p>If the values are custom objects a function to check equality between values
         * must be provided. Example:</p>
         *
         * <pre>
         * function petsAreEqualByAge(pet1,pet2) {
           *  return pet1.age===pet2.age;
           * }
         * </pre>
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function
         * to convert keys to strings. If the keys aren't strings or if toString()
         * is not appropriate, a custom function which receives a key and returns a
         * unique string must be provided.
         * @param {function(Object,Object):boolean=} valuesEqualsFunction optional
         * function to check if two values are equal.
         *
         * @param allowDuplicateValues
         */
        function MultiDictionary(toStrFunction, valuesEqualsFunction, allowDuplicateValues) {
            if (allowDuplicateValues === void 0) { allowDuplicateValues = false; }
            this.dict = new Dictionary(toStrFunction);
            this.equalsF = valuesEqualsFunction || collections.defaultEquals;
            this.allowDuplicate = allowDuplicateValues;
        }
        /**
        * Returns an array holding the values to which this dictionary maps
        * the specified key.
        * Returns an empty array if this dictionary contains no mappings for this key.
        * @param {Object} key key whose associated values are to be returned.
        * @return {Array} an array holding the values to which this dictionary maps
        * the specified key.
        */
        MultiDictionary.prototype.getValue = function (key) {
            var values = this.dict.getValue(key);
            if (collections.isUndefined(values)) {
                return [];
            }
            return collections.arrays.copy(values);
        };
        /**
         * Adds the value to the array associated with the specified key, if
         * it is not already present.
         * @param {Object} key key with which the specified value is to be
         * associated.
         * @param {Object} value the value to add to the array at the key
         * @return {boolean} true if the value was not already associated with that key.
         */
        MultiDictionary.prototype.setValue = function (key, value) {
            if (collections.isUndefined(key) || collections.isUndefined(value)) {
                return false;
            }
            if (!this.containsKey(key)) {
                this.dict.setValue(key, [value]);
                return true;
            }
            var array = this.dict.getValue(key);
            if (!this.allowDuplicate) {
                if (collections.arrays.contains(array, value, this.equalsF)) {
                    return false;
                }
            }
            array.push(value);
            return true;
        };
        /**
         * Removes the specified values from the array of values associated with the
         * specified key. If a value isn't given, all values associated with the specified
         * key are removed.
         * @param {Object} key key whose mapping is to be removed from the
         * dictionary.
         * @param {Object=} value optional argument to specify the value to remove
         * from the array associated with the specified key.
         * @return {*} true if the dictionary changed, false if the key doesn't exist or
         * if the specified value isn't associated with the specified key.
         */
        MultiDictionary.prototype.remove = function (key, value) {
            if (collections.isUndefined(value)) {
                var v = this.dict.remove(key);
                return !collections.isUndefined(v);
            }
            var array = this.dict.getValue(key);
            if (collections.arrays.remove(array, value, this.equalsF)) {
                if (array.length === 0) {
                    this.dict.remove(key);
                }
                return true;
            }
            return false;
        };
        /**
         * Returns an array containing all of the keys in this dictionary.
         * @return {Array} an array containing all of the keys in this dictionary.
         */
        MultiDictionary.prototype.keys = function () {
            return this.dict.keys();
        };
        /**
         * Returns an array containing all of the values in this dictionary.
         * @return {Array} an array containing all of the values in this dictionary.
         */
        MultiDictionary.prototype.values = function () {
            var values = this.dict.values();
            var array = [];
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                for (var j = 0; j < v.length; j++) {
                    array.push(v[j]);
                }
            }
            return array;
        };
        /**
         * Returns true if this dictionary at least one value associatted the specified key.
         * @param {Object} key key whose presence in this dictionary is to be
         * tested.
         * @return {boolean} true if this dictionary at least one value associatted
         * the specified key.
         */
        MultiDictionary.prototype.containsKey = function (key) {
            return this.dict.containsKey(key);
        };
        /**
         * Removes all mappings from this dictionary.
         */
        MultiDictionary.prototype.clear = function () {
            this.dict.clear();
        };
        /**
         * Returns the number of keys in this dictionary.
         * @return {number} the number of key-value mappings in this dictionary.
         */
        MultiDictionary.prototype.size = function () {
            return this.dict.size();
        };
        /**
         * Returns true if this dictionary contains no mappings.
         * @return {boolean} true if this dictionary contains no mappings.
         */
        MultiDictionary.prototype.isEmpty = function () {
            return this.dict.isEmpty();
        };
        return MultiDictionary;
    }());
    collections.MultiDictionary = MultiDictionary; // end of multi dictionary 
    var Heap = (function () {
        /**
         * Creates an empty Heap.
         * @class
         * <p>A heap is a binary tree, where the nodes maintain the heap property:
         * each node is smaller than each of its children and therefore a MinHeap
         * This implementation uses an array to store elements.</p>
         * <p>If the inserted elements are custom objects a compare function must be provided,
         *  at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
         *
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * <p>If a Max-Heap is wanted (greater elements on top) you can a provide a
         * reverse compare function to accomplish that behavior. Example:</p>
         *
         * <pre>
         * function reverseCompare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return 1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return -1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function Heap(compareFunction) {
            /**
             * Array used to store the elements od the heap.
             * @type {Array.<Object>}
             * @private
             */
            this.data = [];
            this.compare = compareFunction || collections.defaultCompare;
        }
        /**
         * Returns the index of the left child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the left child
         * for.
         * @return {number} The index of the left child.
         * @private
         */
        Heap.prototype.leftChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 1;
        };
        /**
         * Returns the index of the right child of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the right child
         * for.
         * @return {number} The index of the right child.
         * @private
         */
        Heap.prototype.rightChildIndex = function (nodeIndex) {
            return (2 * nodeIndex) + 2;
        };
        /**
         * Returns the index of the parent of the node at the given index.
         * @param {number} nodeIndex The index of the node to get the parent for.
         * @return {number} The index of the parent.
         * @private
         */
        Heap.prototype.parentIndex = function (nodeIndex) {
            return Math.floor((nodeIndex - 1) / 2);
        };
        /**
         * Returns the index of the smaller child node (if it exists).
         * @param {number} leftChild left child index.
         * @param {number} rightChild right child index.
         * @return {number} the index with the minimum value or -1 if it doesn't
         * exists.
         * @private
         */
        Heap.prototype.minIndex = function (leftChild, rightChild) {
            if (rightChild >= this.data.length) {
                if (leftChild >= this.data.length) {
                    return -1;
                }
                else {
                    return leftChild;
                }
            }
            else {
                if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                    return leftChild;
                }
                else {
                    return rightChild;
                }
            }
        };
        /**
         * Moves the node at the given index up to its proper place in the heap.
         * @param {number} index The index of the node to move up.
         * @private
         */
        Heap.prototype.siftUp = function (index) {
            var parent = this.parentIndex(index);
            while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
                collections.arrays.swap(this.data, parent, index);
                index = parent;
                parent = this.parentIndex(index);
            }
        };
        /**
         * Moves the node at the given index down to its proper place in the heap.
         * @param {number} nodeIndex The index of the node to move down.
         * @private
         */
        Heap.prototype.siftDown = function (nodeIndex) {
            //smaller child index
            var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
                collections.arrays.swap(this.data, min, nodeIndex);
                nodeIndex = min;
                min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
            }
        };
        /**
         * Retrieves but does not remove the root element of this heap.
         * @return {*} The value at the root of the heap. Returns undefined if the
         * heap is empty.
         */
        Heap.prototype.peek = function () {
            if (this.data.length > 0) {
                return this.data[0];
            }
            else {
                return undefined;
            }
        };
        /**
         * Adds the given element into the heap.
         * @param {*} element the element.
         * @return true if the element was added or fals if it is undefined.
         */
        Heap.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return undefined;
            }
            this.data.push(element);
            this.siftUp(this.data.length - 1);
            return true;
        };
        /**
         * Retrieves and removes the root element of this heap.
         * @return {*} The value removed from the root of the heap. Returns
         * undefined if the heap is empty.
         */
        Heap.prototype.removeRoot = function () {
            if (this.data.length > 0) {
                var obj = this.data[0];
                this.data[0] = this.data[this.data.length - 1];
                this.data.splice(this.data.length - 1, 1);
                if (this.data.length > 0) {
                    this.siftDown(0);
                }
                return obj;
            }
            return undefined;
        };
        /**
         * Returns true if this heap contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this Heap contains the specified element, false
         * otherwise.
         */
        Heap.prototype.contains = function (element) {
            var equF = collections.compareToEquals(this.compare);
            return collections.arrays.contains(this.data, element, equF);
        };
        /**
         * Returns the number of elements in this heap.
         * @return {number} the number of elements in this heap.
         */
        Heap.prototype.size = function () {
            return this.data.length;
        };
        /**
         * Checks if this heap is empty.
         * @return {boolean} true if and only if this heap contains no items; false
         * otherwise.
         */
        Heap.prototype.isEmpty = function () {
            return this.data.length <= 0;
        };
        /**
         * Removes all of the elements from this heap.
         */
        Heap.prototype.clear = function () {
            this.data.length = 0;
        };
        /**
         * Executes the provided function once for each element present in this heap in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Heap.prototype.forEach = function (callback) {
            collections.arrays.forEach(this.data, callback);
        };
        return Heap;
    }());
    collections.Heap = Heap;
    var Stack = (function () {
        /**
         * Creates an empty Stack.
         * @class A Stack is a Last-In-First-Out (LIFO) data structure, the last
         * element added to the stack will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Stack() {
            this.list = new LinkedList();
        }
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the element to be pushed onto this stack.
         * @return {boolean} true if the element was pushed or false if it is undefined.
         */
        Stack.prototype.push = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Pushes an item onto the top of this stack.
         * @param {Object} elem the element to be pushed onto this stack.
         * @return {boolean} true if the element was pushed or false if it is undefined.
         */
        Stack.prototype.add = function (elem) {
            return this.list.add(elem, 0);
        };
        /**
         * Removes the object at the top of this stack and returns that object.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.pop = function () {
            return this.list.removeElementAtIndex(0);
        };
        /**
         * Looks at the object at the top of this stack without removing it from the
         * stack.
         * @return {*} the object at the top of this stack or undefined if the
         * stack is empty.
         */
        Stack.prototype.peek = function () {
            return this.list.first();
        };
        /**
         * Returns the number of elements in this stack.
         * @return {number} the number of elements in this stack.
         */
        Stack.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this stack contains the specified element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this stack contains the specified element,
         * false otherwise.
         */
        Stack.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this stack is empty.
         * @return {boolean} true if and only if this stack contains no items; false
         * otherwise.
         */
        Stack.prototype.isEmpty = function () {
            return this.list.isEmpty();
        };
        /**
         * Removes all of the elements from this stack.
         */
        Stack.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each element present in this stack in
         * LIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Stack.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Stack;
    }());
    collections.Stack = Stack; // End of stack 
    var Queue = (function () {
        /**
         * Creates an empty queue.
         * @class A queue is a First-In-First-Out (FIFO) data structure, the first
         * element added to the queue will be the first one to be removed. This
         * implementation uses a linked list as a container.
         * @constructor
         */
        function Queue() {
            this.list = new LinkedList();
        }
        /**
         * Inserts the specified element into the end of this queue.
         * @param {Object} elem the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        Queue.prototype.enqueue = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Inserts the specified element into the end of this queue.
         * @param {Object} elem the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        Queue.prototype.add = function (elem) {
            return this.list.add(elem);
        };
        /**
         * Retrieves and removes the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.dequeue = function () {
            if (this.list.size() !== 0) {
                var el = this.list.first();
                this.list.removeElementAtIndex(0);
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the head of this queue.
         * @return {*} the head of this queue, or undefined if this queue is empty.
         */
        Queue.prototype.peek = function () {
            if (this.list.size() !== 0) {
                return this.list.first();
            }
            return undefined;
        };
        /**
         * Returns the number of elements in this queue.
         * @return {number} the number of elements in this queue.
         */
        Queue.prototype.size = function () {
            return this.list.size();
        };
        /**
         * Returns true if this queue contains the specified element.
         * <p>If the elements inside this stack are
         * not comparable with the === operator, a custom equals function should be
         * provided to perform searches, the function must receive two arguments and
         * return true if they are equal, false otherwise. Example:</p>
         *
         * <pre>
         * var petsAreEqualByName (pet1, pet2) {
         *  return pet1.name === pet2.name;
         * }
         * </pre>
         * @param {Object} elem element to search for.
         * @param {function(Object,Object):boolean=} equalsFunction optional
         * function to check if two elements are equal.
         * @return {boolean} true if this queue contains the specified element,
         * false otherwise.
         */
        Queue.prototype.contains = function (elem, equalsFunction) {
            return this.list.contains(elem, equalsFunction);
        };
        /**
         * Checks if this queue is empty.
         * @return {boolean} true if and only if this queue contains no items; false
         * otherwise.
         */
        Queue.prototype.isEmpty = function () {
            return this.list.size() <= 0;
        };
        /**
         * Removes all of the elements from this queue.
         */
        Queue.prototype.clear = function () {
            this.list.clear();
        };
        /**
         * Executes the provided function once for each element present in this queue in
         * FIFO order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        Queue.prototype.forEach = function (callback) {
            this.list.forEach(callback);
        };
        return Queue;
    }());
    collections.Queue = Queue; // End of queue
    var PriorityQueue = (function () {
        /**
         * Creates an empty priority queue.
         * @class <p>In a priority queue each element is associated with a "priority",
         * elements are dequeued in highest-priority-first order (the elements with the
         * highest priority are dequeued first). Priority Queues are implemented as heaps.
         * If the inserted elements are custom objects a compare function must be provided,
         * otherwise the <=, === and >= operators are used to compare object priority.</p>
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two element priorities. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function PriorityQueue(compareFunction) {
            this.heap = new Heap(collections.reverseCompareFunction(compareFunction));
        }
        /**
         * Inserts the specified element into this priority queue.
         * @param {Object} element the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.enqueue = function (element) {
            return this.heap.add(element);
        };
        /**
         * Inserts the specified element into this priority queue.
         * @param {Object} element the element to insert.
         * @return {boolean} true if the element was inserted, or false if it is undefined.
         */
        PriorityQueue.prototype.add = function (element) {
            return this.heap.add(element);
        };
        /**
         * Retrieves and removes the highest priority element of this queue.
         * @return {*} the the highest priority element of this queue,
         *  or undefined if this queue is empty.
         */
        PriorityQueue.prototype.dequeue = function () {
            if (this.heap.size() !== 0) {
                var el = this.heap.peek();
                this.heap.removeRoot();
                return el;
            }
            return undefined;
        };
        /**
         * Retrieves, but does not remove, the highest priority element of this queue.
         * @return {*} the highest priority element of this queue, or undefined if this queue is empty.
         */
        PriorityQueue.prototype.peek = function () {
            return this.heap.peek();
        };
        /**
         * Returns true if this priority queue contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this priority queue contains the specified element,
         * false otherwise.
         */
        PriorityQueue.prototype.contains = function (element) {
            return this.heap.contains(element);
        };
        /**
         * Checks if this priority queue is empty.
         * @return {boolean} true if and only if this priority queue contains no items; false
         * otherwise.
         */
        PriorityQueue.prototype.isEmpty = function () {
            return this.heap.isEmpty();
        };
        /**
         * Returns the number of elements in this priority queue.
         * @return {number} the number of elements in this priority queue.
         */
        PriorityQueue.prototype.size = function () {
            return this.heap.size();
        };
        /**
         * Removes all of the elements from this priority queue.
         */
        PriorityQueue.prototype.clear = function () {
            this.heap.clear();
        };
        /**
         * Executes the provided function once for each element present in this queue in
         * no particular order.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        PriorityQueue.prototype.forEach = function (callback) {
            this.heap.forEach(callback);
        };
        return PriorityQueue;
    }());
    collections.PriorityQueue = PriorityQueue; // end of priority queue
    var Set = (function () {
        /**
         * Creates an empty set.
         * @class <p>A set is a data structure that contains no duplicate items.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStringFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives a onject and returns a
         * unique string must be provided.
         */
        function Set(toStringFunction) {
            this.dictionary = new Dictionary(toStringFunction);
        }
        /**
         * Returns true if this set contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this set contains the specified element,
         * false otherwise.
         */
        Set.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
         * Adds the specified element to this set if it is not already present.
         * @param {Object} element the element to insert.
         * @return {boolean} true if this set did not already contain the specified element.
         */
        Set.prototype.add = function (element) {
            if (this.contains(element) || collections.isUndefined(element)) {
                return false;
            }
            else {
                this.dictionary.setValue(element, element);
                return true;
            }
        };
        /**
         * Performs an intersecion between this an another set.
         * Removes all values that are not present this set and the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.intersection = function (otherSet) {
            var set = this;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    set.remove(element);
                }
                return true;
            });
        };
        /**
         * Performs a union between this an another set.
         * Adds all values from the given set to this set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.union = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.add(element);
                return true;
            });
        };
        /**
         * Performs a difference between this an another set.
         * Removes from this set all the values that are present in the given set.
         * @param {collections.Set} otherSet other set.
         */
        Set.prototype.difference = function (otherSet) {
            var set = this;
            otherSet.forEach(function (element) {
                set.remove(element);
                return true;
            });
        };
        /**
         * Checks whether the given set contains all the elements in this set.
         * @param {collections.Set} otherSet other set.
         * @return {boolean} true if this set is a subset of the given set.
         */
        Set.prototype.isSubsetOf = function (otherSet) {
            if (this.size() > otherSet.size()) {
                return false;
            }
            var isSub = true;
            this.forEach(function (element) {
                if (!otherSet.contains(element)) {
                    isSub = false;
                    return false;
                }
                return true;
            });
            return isSub;
        };
        /**
         * Removes the specified element from this set if it is present.
         * @return {boolean} true if this set contained the specified element.
         */
        Set.prototype.remove = function (element) {
            if (!this.contains(element)) {
                return false;
            }
            else {
                this.dictionary.remove(element);
                return true;
            }
        };
        /**
         * Executes the provided function once for each element
         * present in this set.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one arguments: the element. To break the iteration you can
         * optionally return false.
         */
        Set.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                return callback(v);
            });
        };
        /**
         * Returns an array containing all of the elements in this set in arbitrary order.
         * @return {Array} an array containing all of the elements in this set.
         */
        Set.prototype.toArray = function () {
            return this.dictionary.values();
        };
        /**
         * Returns true if this set contains no elements.
         * @return {boolean} true if this set contains no elements.
         */
        Set.prototype.isEmpty = function () {
            return this.dictionary.isEmpty();
        };
        /**
         * Returns the number of elements in this set.
         * @return {number} the number of elements in this set.
         */
        Set.prototype.size = function () {
            return this.dictionary.size();
        };
        /**
         * Removes all of the elements from this set.
         */
        Set.prototype.clear = function () {
            this.dictionary.clear();
        };
        /*
        * Provides a string representation for display
        */
        Set.prototype.toString = function () {
            return collections.arrays.toString(this.toArray());
        };
        return Set;
    }());
    collections.Set = Set; // end of Set
    var Bag = (function () {
        /**
         * Creates an empty bag.
         * @class <p>A bag is a special kind of set in which members are
         * allowed to appear more than once.</p>
         * <p>If the inserted elements are custom objects a function
         * which converts elements to unique strings must be provided. Example:</p>
         *
         * <pre>
         * function petToString(pet) {
         *  return pet.name;
         * }
         * </pre>
         *
         * @constructor
         * @param {function(Object):string=} toStrFunction optional function used
         * to convert elements to strings. If the elements aren't strings or if toString()
         * is not appropriate, a custom function which receives an object and returns a
         * unique string must be provided.
         */
        function Bag(toStrFunction) {
            this.toStrF = toStrFunction || collections.defaultToString;
            this.dictionary = new Dictionary(this.toStrF);
            this.nElements = 0;
        }
        /**
        * Adds nCopies of the specified object to this bag.
        * @param {Object} element element to add.
        * @param {number=} nCopies the number of copies to add, if this argument is
        * undefined 1 copy is added.
        * @return {boolean} true unless element is undefined.
        */
        Bag.prototype.add = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                var node = {
                    value: element,
                    copies: nCopies
                };
                this.dictionary.setValue(element, node);
            }
            else {
                this.dictionary.getValue(element).copies += nCopies;
            }
            this.nElements += nCopies;
            return true;
        };
        /**
        * Counts the number of copies of the specified object in this bag.
        * @param {Object} element the object to search for..
        * @return {number} the number of copies of the object, 0 if not found
        */
        Bag.prototype.count = function (element) {
            if (!this.contains(element)) {
                return 0;
            }
            else {
                return this.dictionary.getValue(element).copies;
            }
        };
        /**
         * Returns true if this bag contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this bag contains the specified element,
         * false otherwise.
         */
        Bag.prototype.contains = function (element) {
            return this.dictionary.containsKey(element);
        };
        /**
        * Removes nCopies of the specified object to this bag.
        * If the number of copies to remove is greater than the actual number
        * of copies in the Bag, all copies are removed.
        * @param {Object} element element to remove.
        * @param {number=} nCopies the number of copies to remove, if this argument is
        * undefined 1 copy is removed.
        * @return {boolean} true if at least 1 element was removed.
        */
        Bag.prototype.remove = function (element, nCopies) {
            if (nCopies === void 0) { nCopies = 1; }
            if (collections.isUndefined(element) || nCopies <= 0) {
                return false;
            }
            if (!this.contains(element)) {
                return false;
            }
            else {
                var node = this.dictionary.getValue(element);
                if (nCopies > node.copies) {
                    this.nElements -= node.copies;
                }
                else {
                    this.nElements -= nCopies;
                }
                node.copies -= nCopies;
                if (node.copies <= 0) {
                    this.dictionary.remove(element);
                }
                return true;
            }
        };
        /**
         * Returns an array containing all of the elements in this big in arbitrary order,
         * including multiple copies.
         * @return {Array} an array containing all of the elements in this bag.
         */
        Bag.prototype.toArray = function () {
            var a = [];
            var values = this.dictionary.values();
            var vl = values.length;
            for (var i = 0; i < vl; i++) {
                var node = values[i];
                var element = node.value;
                var copies = node.copies;
                for (var j = 0; j < copies; j++) {
                    a.push(element);
                }
            }
            return a;
        };
        /**
         * Returns a set of unique elements in this bag.
         * @return {collections.Set<T>} a set of unique elements in this bag.
         */
        Bag.prototype.toSet = function () {
            var toret = new Set(this.toStrF);
            var elements = this.dictionary.values();
            var l = elements.length;
            for (var i = 0; i < l; i++) {
                var value = elements[i].value;
                toret.add(value);
            }
            return toret;
        };
        /**
         * Executes the provided function once for each element
         * present in this bag, including multiple copies.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element. To break the iteration you can
         * optionally return false.
         */
        Bag.prototype.forEach = function (callback) {
            this.dictionary.forEach(function (k, v) {
                var value = v.value;
                var copies = v.copies;
                for (var i = 0; i < copies; i++) {
                    if (callback(value) === false) {
                        return false;
                    }
                }
                return true;
            });
        };
        /**
         * Returns the number of elements in this bag.
         * @return {number} the number of elements in this bag.
         */
        Bag.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this bag contains no elements.
         * @return {boolean} true if this bag contains no elements.
         */
        Bag.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Removes all of the elements from this bag.
         */
        Bag.prototype.clear = function () {
            this.nElements = 0;
            this.dictionary.clear();
        };
        return Bag;
    }());
    collections.Bag = Bag; // End of bag 
    var BSTree = (function () {
        /**
         * Creates an empty binary search tree.
         * @class <p>A binary search tree is a binary tree in which each
         * internal node stores an element such that the elements stored in the
         * left subtree are less than it and the elements
         * stored in the right subtree are greater.</p>
         * <p>Formally, a binary search tree is a node-based binary tree data structure which
         * has the following properties:</p>
         * <ul>
         * <li>The left subtree of a node contains only nodes with elements less
         * than the node's element</li>
         * <li>The right subtree of a node contains only nodes with elements greater
         * than the node's element</li>
         * <li>Both the left and right subtrees must also be binary search trees.</li>
         * </ul>
         * <p>If the inserted elements are custom objects a compare function must
         * be provided at construction time, otherwise the <=, === and >= operators are
         * used to compare elements. Example:</p>
         * <pre>
         * function compare(a, b) {
         *  if (a is less than b by some ordering criterion) {
         *     return -1;
         *  } if (a is greater than b by the ordering criterion) {
         *     return 1;
         *  }
         *  // a must be equal to b
         *  return 0;
         * }
         * </pre>
         * @constructor
         * @param {function(Object,Object):number=} compareFunction optional
         * function used to compare two elements. Must return a negative integer,
         * zero, or a positive integer as the first argument is less than, equal to,
         * or greater than the second.
         */
        function BSTree(compareFunction) {
            this.root = null;
            this.compare = compareFunction || collections.defaultCompare;
            this.nElements = 0;
        }
        /**
         * Adds the specified element to this tree if it is not already present.
         * @param {Object} element the element to insert.
         * @return {boolean} true if this tree did not already contain the specified element.
         */
        BSTree.prototype.add = function (element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            if (this.insertNode(this.createNode(element)) !== null) {
                this.nElements++;
                return true;
            }
            return false;
        };
        /**
         * Removes all of the elements from this tree.
         */
        BSTree.prototype.clear = function () {
            this.root = null;
            this.nElements = 0;
        };
        /**
         * Returns true if this tree contains no elements.
         * @return {boolean} true if this tree contains no elements.
         */
        BSTree.prototype.isEmpty = function () {
            return this.nElements === 0;
        };
        /**
         * Returns the number of elements in this tree.
         * @return {number} the number of elements in this tree.
         */
        BSTree.prototype.size = function () {
            return this.nElements;
        };
        /**
         * Returns true if this tree contains the specified element.
         * @param {Object} element element to search for.
         * @return {boolean} true if this tree contains the specified element,
         * false otherwise.
         */
        BSTree.prototype.contains = function (element) {
            if (collections.isUndefined(element)) {
                return false;
            }
            return this.searchNode(this.root, element) !== null;
        };
        /**
         * Removes the specified element from this tree if it is present.
         * @return {boolean} true if this tree contained the specified element.
         */
        BSTree.prototype.remove = function (element) {
            var node = this.searchNode(this.root, element);
            if (node === null) {
                return false;
            }
            this.removeNode(node);
            this.nElements--;
            return true;
        };
        /**
         * Executes the provided function once for each element present in this tree in
         * in-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.inorderTraversal = function (callback) {
            this.inorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in pre-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.preorderTraversal = function (callback) {
            this.preorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in post-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.postorderTraversal = function (callback) {
            this.postorderTraversalAux(this.root, callback, {
                stop: false
            });
        };
        /**
         * Executes the provided function once for each element present in this tree in
         * level-order.
         * @param {function(Object):*} callback function to execute, it is invoked with one
         * argument: the element value, to break the iteration you can optionally return false.
         */
        BSTree.prototype.levelTraversal = function (callback) {
            this.levelTraversalAux(this.root, callback);
        };
        /**
         * Returns the minimum element of this tree.
         * @return {*} the minimum element of this tree or undefined if this tree is
         * is empty.
         */
        BSTree.prototype.minimum = function () {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.minimumAux(this.root).element;
        };
        /**
         * Returns the maximum element of this tree.
         * @return {*} the maximum element of this tree or undefined if this tree is
         * is empty.
         */
        BSTree.prototype.maximum = function () {
            if (this.isEmpty()) {
                return undefined;
            }
            return this.maximumAux(this.root).element;
        };
        /**
         * Executes the provided function once for each element present in this tree in inorder.
         * Equivalent to inorderTraversal.
         * @param {function(Object):*} callback function to execute, it is
         * invoked with one argument: the element value, to break the iteration you can
         * optionally return false.
         */
        BSTree.prototype.forEach = function (callback) {
            this.inorderTraversal(callback);
        };
        /**
         * Returns an array containing all of the elements in this tree in in-order.
         * @return {Array} an array containing all of the elements in this tree in in-order.
         */
        BSTree.prototype.toArray = function () {
            var array = [];
            this.inorderTraversal(function (element) {
                array.push(element);
                return true;
            });
            return array;
        };
        /**
         * Returns the height of this tree.
         * @return {number} the height of this tree or -1 if is empty.
         */
        BSTree.prototype.height = function () {
            return this.heightAux(this.root);
        };
        /**
        * @private
        */
        BSTree.prototype.searchNode = function (node, element) {
            var cmp = null;
            while (node !== null && cmp !== 0) {
                cmp = this.compare(element, node.element);
                if (cmp < 0) {
                    node = node.leftCh;
                }
                else if (cmp > 0) {
                    node = node.rightCh;
                }
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.transplant = function (n1, n2) {
            if (n1.parent === null) {
                this.root = n2;
            }
            else if (n1 === n1.parent.leftCh) {
                n1.parent.leftCh = n2;
            }
            else {
                n1.parent.rightCh = n2;
            }
            if (n2 !== null) {
                n2.parent = n1.parent;
            }
        };
        /**
        * @private
        */
        BSTree.prototype.removeNode = function (node) {
            if (node.leftCh === null) {
                this.transplant(node, node.rightCh);
            }
            else if (node.rightCh === null) {
                this.transplant(node, node.leftCh);
            }
            else {
                var y = this.minimumAux(node.rightCh);
                if (y.parent !== node) {
                    this.transplant(y, y.rightCh);
                    y.rightCh = node.rightCh;
                    y.rightCh.parent = y;
                }
                this.transplant(node, y);
                y.leftCh = node.leftCh;
                y.leftCh.parent = y;
            }
        };
        /**
        * @private
        */
        BSTree.prototype.inorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.inorderTraversalAux(node.rightCh, callback, signal);
        };
        /**
        * @private
        */
        BSTree.prototype.levelTraversalAux = function (node, callback) {
            var queue = new Queue();
            if (node !== null) {
                queue.enqueue(node);
            }
            while (!queue.isEmpty()) {
                node = queue.dequeue();
                if (callback(node.element) === false) {
                    return;
                }
                if (node.leftCh !== null) {
                    queue.enqueue(node.leftCh);
                }
                if (node.rightCh !== null) {
                    queue.enqueue(node.rightCh);
                }
            }
        };
        /**
        * @private
        */
        BSTree.prototype.preorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.preorderTraversalAux(node.rightCh, callback, signal);
        };
        /**
        * @private
        */
        BSTree.prototype.postorderTraversalAux = function (node, callback, signal) {
            if (node === null || signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.leftCh, callback, signal);
            if (signal.stop) {
                return;
            }
            this.postorderTraversalAux(node.rightCh, callback, signal);
            if (signal.stop) {
                return;
            }
            signal.stop = callback(node.element) === false;
        };
        /**
        * @private
        */
        BSTree.prototype.minimumAux = function (node) {
            while (node.leftCh !== null) {
                node = node.leftCh;
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.maximumAux = function (node) {
            while (node.rightCh !== null) {
                node = node.rightCh;
            }
            return node;
        };
        /**
          * @private
          */
        BSTree.prototype.heightAux = function (node) {
            if (node === null) {
                return -1;
            }
            return Math.max(this.heightAux(node.leftCh), this.heightAux(node.rightCh)) + 1;
        };
        /*
        * @private
        */
        BSTree.prototype.insertNode = function (node) {
            var parent = null;
            var position = this.root;
            var cmp = null;
            while (position !== null) {
                cmp = this.compare(node.element, position.element);
                if (cmp === 0) {
                    return null;
                }
                else if (cmp < 0) {
                    parent = position;
                    position = position.leftCh;
                }
                else {
                    parent = position;
                    position = position.rightCh;
                }
            }
            node.parent = parent;
            if (parent === null) {
                // tree is empty
                this.root = node;
            }
            else if (this.compare(node.element, parent.element) < 0) {
                parent.leftCh = node;
            }
            else {
                parent.rightCh = node;
            }
            return node;
        };
        /**
        * @private
        */
        BSTree.prototype.createNode = function (element) {
            return {
                element: element,
                leftCh: null,
                rightCh: null,
                parent: null
            };
        };
        return BSTree;
    }());
    collections.BSTree = BSTree; // end of BSTree
})(collections || (collections = {})); // End of module 
//# sourceMappingURL=collections.js.map
/// </// <reference path="typings/browser/definitions/moment/index.d.ts" />
var fastnet;
(function (fastnet) {
    var date = (function () {
        function date() {
        }
        date.toDate = function (d) {
            if (d instanceof Date) {
                return d;
            }
            else {
                var md;
                if (typeof d === "string") {
                    md = this.toMoment(d);
                }
                else {
                    md = d;
                }
                return md.toDate();
            }
        };
        date.toMoment = function (d) {
            if (typeof d === "string") {
                if (d.length >= 19 && d.indexOf('T') === 10) {
                    // is an isoDate?
                    return moment(d);
                }
                else {
                    return moment(d, date.stdDateFormat);
                }
            }
            else {
                return moment(d);
            }
        };
        date.toDateString = function (d) {
            var md;
            if (typeof d === "string") {
                md = this.toMoment(d);
            }
            else {
                if (d instanceof Date) {
                    md = moment(d);
                }
                else {
                    md = d;
                }
            }
            return md.format(date.stdDateFormat);
        };
        date.toDateTimeString = function (d) {
            var md;
            if (typeof d === "string") {
                md = this.toMoment(d);
            }
            else {
                if (d instanceof Date) {
                    md = moment(d);
                }
                else {
                    md = d;
                }
            }
            return md.format(date.stdDateTimeFormat);
        };
        date.toDateTimeSecString = function (d) {
            var md;
            if (typeof d === "string") {
                md = this.toMoment(d);
            }
            else {
                if (d instanceof Date) {
                    md = moment(d);
                }
                else {
                    md = d;
                }
            }
            return md.format(date.stdDateTimeSecFormat);
        };
        date.stdDateFormat = "DDMMMYYYY";
        date.stdDateTimeFormat = "DDMMMYYYY HH:mm";
        date.stdDateTimeSecFormat = "DDMMMYYYY HH:mm:ss";
        return date;
    }());
    fastnet.date = date;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=date.js.map
var fastnet;
(function (fastnet) {
    // *NB* this interface is an image of the C# class dataResult
    // that can be found in Fastnet.Core.Web which is a nuget package
    // (from the soultion Fastent.Packages)
    var dataResult = (function () {
        function dataResult() {
        }
        return dataResult;
    }());
    fastnet.dataResult = dataResult;
    var ajax = (function () {
        function ajax() {
        }
        ajax.init = function () {
            var url = $('head base').attr('href');
            this.rootUrl = url;
            //debug.print(`rootUrl is ${this.rootUrl}`);
            $(document).ajaxError(this.ajaxError);
        };
        /**
         * Make a GET web api call using contentType "application/json" and returns a Promise<dataResult>
         * @param args Set to an object of type ajaxGetArgs
         * @param isFullUrl set true if args is the full url. By default this false, and args is prefixed with the url for the current site
         */
        ajax.Get = function (args, isFullUrl) {
            if (isFullUrl === void 0) { isFullUrl = false; }
            var cache = true;
            if (args.cache !== undefined && args.cache === false) {
                cache = args.cache;
            }
            var url = isFullUrl ? args.url : this.rootUrl + args.url;
            return new Promise(function (resolve, reject) {
                $.ajax({ url: url, contentType: "application/json", type: "GET", cache: cache })
                    .fail(function (jqXhr, textStatus, err) {
                    fastnet.debug.print("GET Query: " + url + " failed: status " + textStatus + ", error " + err);
                    reject(err);
                })
                    .done(function (data, textStatus, jqXhr) {
                    var dr = null;
                    if (data instanceof dataResult) {
                        // convert into a dataResult
                        dr = data;
                    }
                    else {
                        dr = new dataResult();
                        dr.data = data;
                        dr.success = true;
                        dr.message = dr.exceptionMessage = null;
                    }
                    if (!data.success) {
                        fastnet.debug.print("GET Query: " + url + " dataResult failed: message " + data.message + ", exceptio " + data.exceptionMessage);
                    }
                    resolve(data);
                });
            });
        };
        // private static GetOld(args: ajaxGetArgs, isFullUrl: boolean = false): JQueryXHR {
        //     var cache: boolean = true;
        //     if (args.cache !== undefined && args.cache === false) {
        //         cache = args.cache;
        //     }
        //     var url = isFullUrl ? args.url : this.rootUrl + args.url;
        //     return $.ajax({
        //         url: url,// this.rootUrl + args.url,
        //         contentType: "application/json",
        //         type: "GET",
        //         cache: cache,
        //     });
        // }
        /**
         * Make a POST web api call using contentType "application/json" and return a Promise<dataResult>
         * @param args Set to an object of type ajaxPostArgs
         * @param isFullurl set true if args is the full url. By default this false, and args is prefixed with url for the current site
         */
        ajax.Post = function (args, isFullurl) {
            if (isFullurl === void 0) { isFullurl = false; }
            var url = isFullurl ? args.url : this.rootUrl + args.url;
            return new Promise(function (resolve, reject) {
                $.ajax({ url: url, contentType: "application/json; charset=UTF-8", type: "POST", data: JSON.stringify(args.data) })
                    .fail(function (jqXhr, textStatus, err) {
                    fastnet.debug.print("POST Query: " + url + " failed: status " + textStatus + ", error " + err);
                    reject(err);
                })
                    .done(function (data, textStatus, jqXhr) {
                    var dr = null;
                    if (data === null || data instanceof dataResult) {
                        // convert into a dataResult
                        dr = data;
                    }
                    else {
                        dr = new dataResult();
                        dr.data = data;
                        dr.success = true;
                        dr.message = dr.exceptionMessage = null;
                    }
                    if (!data.success) {
                        fastnet.debug.print("POST Query: " + url + " dataResult failed: message " + data.message + ", exceptio " + data.exceptionMessage);
                    }
                    resolve(data);
                });
            });
        };
        // public static PostOld(args: ajaxPostArgs, isFullurl: boolean = false) {
        //     var url = isFullurl ? args.url : this.rootUrl + args.url;
        //     return $.ajax({
        //         url: url,// this.rootUrl + args.url,
        //         contentType: "application/json; charset=UTF-8",
        //         type: "POST",
        //         data: JSON.stringify(args.data)
        //     });
        // }
        // public static GetScript(url: string): JQueryXHR {
        //     return $.ajax({
        //         url: url,
        //         dataType: "script",
        //         cache: true
        //     });
        // }
        ajax.ajaxError = function (event, jqXHR, settings, thrownError) {
            var errorMessage = "Internal error\nCall to \"" + settings.url + "\" failed: " + thrownError;
            fastnet.debug.print(errorMessage);
            // how to call a system form here? alert()??
            alert(errorMessage);
        };
        ajax.rootUrl = "/";
        return ajax;
    }());
    fastnet.ajax = ajax;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=ajax.js.map
var fastnet;
(function (fastnet) {
    var template = (function () {
        function template() {
        }
        // public static fetchOld(templateName: string): JQueryPromise<string> {
        //     var deferred = $.Deferred<string>();
        //     ajax.Get({ url: `template/get/${templateName}` }).then((r: dataResult) => {
        //         if (r.success) {
        //             deferred.resolve(r.data);
        //         } else {
        //             deferred.resolve(null);
        //         }
        //     });
        //     return deferred.promise();
        // }
        template.fetch = function (templateName) {
            return new Promise(function (resolve, reject) {
                fastnet.ajax.Get({ url: "template/get/" + templateName }).then(function (r) {
                    if (r.success) {
                        resolve(r.data);
                    }
                    else {
                        reject(r.exceptionMessage);
                    }
                });
            });
        };
        return template;
    }());
    fastnet.template = template;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=template.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fastnet;
(function (fastnet) {
    // export interface validatableModel {
    //     hasError: KnockoutObservable<boolean>;
    //     validationMessage: KnockoutObservable<string>;
    // }
    // knockout model container: use this as viewmodel when the contained model needs to be replaceable
    var koContainer = (function () {
        function koContainer() {
            this.model = ko.observable(null);
        }
        return koContainer;
    }());
    fastnet.koContainer = koContainer;
    // knockout-validation (kv)
    // some additional guidance
    // 1. kv.init() once called, does not do anything on subsequemt calls (unless you set force = true)
    // 2. kv.init() calls registerExtenders by default. Not sure how to prevent this given point (3)
    // 3. kv replaces the ko.applybindings method with one of its own which first calls kv.init().
    //    If ko.applybindings is used multiple times (on different root elements, for example) then this
    //    creates uncertainty about the point at which init() was called and therefore the point at which
    //    registerExtenders is called.
    // 4. registerExtenders can be safely called multiple times as it will only register additional rules, i.e.
    //    rules that it has not previously registered (note: rules are known uniquely by name) 
    // 5. Safest thing is to always call registerExtenders again after adding a rule (using ko.validation.rules[xxx] =)
    // 6. Further experimentation shows that ko.validation.init() is best called once and as early as possible if non
    //    options are required.
    //
    /**
     *
     */
    var koHelper = (function () {
        function koHelper() {
        }
        koHelper.isBound = function (element) {
            //var index = koh.boundElements.indexOf(element);
            var index = koHelper.findElementIndex(element);
            return index >= 0;
        };
        koHelper.findElementIndex = function (element) {
            var result = -1;
            var a = $(element);
            $.each(koHelper.boundElements, function (i, item) {
                if (a.is($(item))) {
                    result = i;
                    return false;
                }
            });
            return result;
        };
        koHelper.removeElement = function (element) {
            //var index = koh.boundElements.indexOf(element);
            var index = koHelper.findElementIndex(element);
            if (index !== -1) {
                koHelper.boundElements.splice(index, 1);
            }
        };
        koHelper.unBind = function (element) {
            var target = fastnet.toJQuery(element).get(0);
            if (koHelper.isBound(target)) {
                ko.cleanNode(target);
                koHelper.removeElement(target);
            }
        };
        /**
         * Apply a knockout binding at "element" using "model". Any existing binding at the same target will be removed
         * @param model  the data model to bind to
         * @param element the element in the document at which to bind - can be a selector, an Element or a jquery object
         */
        koHelper.bind = function (model, element) {
            var target = fastnet.toJQuery(element).get(0);
            if (koHelper.isBound(target)) {
                koHelper.unBind(target);
            }
            ko.applyBindings(model, target);
            koHelper.boundElements.push(target);
        };
        /**
         * Clear all knockout bindings performed using koHelper.bind().
         */
        koHelper.clear = function () {
            $.each(koHelper.boundElements, function (index, item) {
                ko.cleanNode(item);
            });
            koHelper.boundElements = [];
        };
        /**
         * Initialises knockout-validation using fastnet defaults.
         * These no setting of the title attribute, adding a 'validation-error' class to input on error, and
         * automatic inserting of a span for the error message with a class of 'validationMessage'
         */
        koHelper.initialiseValidation = function () {
            ko.validation.init({
                errorsAsTitle: false,
                decorateInputElement: true,
                errorElementClass: 'validation-error'
            });
        };
        /**
         * Adds standard fastnet validation rules
         * exclusionList - set "exclude" to an array of strings to exclude, e.g. exclude: ["abc", "def"]
         */
        koHelper.addStandardAdditionalValidationRules = function () {
            ko.validation.rules["exclusionList"] = {
                validator: function (newValue, options) {
                    var r = options.find(function (s) {
                        return s === newValue;
                    });
                    return r === null;
                },
                message: "This item already exists"
            };
            ko.validation.registerExtenders();
        };
        koHelper.boundElements = [];
        return koHelper;
    }());
    fastnet.koHelper = koHelper;
    // export interface validationOptions {
    //     errorMessage?: string;
    // }
    // export class validationRules {
    //     public AddStandardRules() {
    //         this.AddValidationRule<any, validationOptions>("required", (newValue, opt) => {
    //             var result = false;
    //             // if (newValue === undefined || newValue.trim().length > 0) {
    //             //     result = true;
    //             // }
    //             if (newValue !== undefined && newValue.trim().length > 0) {
    //                 result = true;
    //             }
    //             return result;
    //         }, "This field is required");
    //     }
    //     public AddValidationRule<T, O extends validationOptions>(name: string, validator: (newValue: T, o: O) => boolean, errorMessage: string) {
    //         if (ko.extenders[name] === undefined) {
    //             ko.extenders[name] = (t: KnockoutObservable<T>, o: O) => {
    //                 this.validationExtension.call(this, t, validator, errorMessage, o);
    //             };
    //         }
    //     }
    //     private validationExtension<T, O extends validationOptions>(target: KnockoutObservable<T>, validator: (p: T, o?: O) => boolean, defaultErrorMessage: string, options?: O): KnockoutObservable<T> {
    //         target.hasError = ko.observable<boolean>();
    //         target.validationMessage = ko.observable<string>();
    //         var validate = (newValue: T) => {
    //             var result = validator(newValue, options);
    //             target.hasError(!result);
    //             target.validationMessage(result ? "" : this.getErrorMessage(defaultErrorMessage, options));
    //         };
    //         validate(target());
    //         target.subscribe(validate);
    //         return target;
    //     }
    //     private getErrorMessage(defaultErrorMessage: string, opt: validationOptions) {
    //         if (!f$.isUndefinedOrNull(opt) && !f$.isUndefinedOrNull(opt.errorMessage)) {
    //             return opt.errorMessage;
    //         } else {
    //             return defaultErrorMessage;
    //         }
    //     }
    // }
    var elementTag = (function () {
        function elementTag(tag) {
            this.tagName = tag.toLowerCase();
        }
        elementTag.prototype.register = function () {
            ko.components.register(this.tagName, this.getComponentConfig());
        };
        elementTag.prototype.getComponentConfig = function () {
            return {
                viewModel: this.getViewModel(),
                template: this.getTemplate()
            };
        };
        elementTag.prototype.getTemplate = function () {
            return null;
        };
        elementTag.prototype.getViewModel = function () {
            return null;
        };
        return elementTag;
    }());
    fastnet.elementTag = elementTag;
    var toggletag = (function (_super) {
        __extends(toggletag, _super);
        function toggletag(tag, downClass, upClass, defaultLabel) {
            if (defaultLabel === void 0) { defaultLabel = null; }
            _super.call(this, tag);
            this.downClass = downClass;
            this.upClass = upClass;
            this.defaultLabel = defaultLabel;
        }
        toggletag.prototype.getTemplate = function () {
            return "<span data-bind='attr: { class : getClass()}'></span><!-- ko if hasLabel --><span class='label' data-bind='text: label'></span><!-- /ko -->";
        };
        toggletag.prototype.createViewModel = function (params, componentInfo) {
            var hasGroup = false;
            var group = $(componentInfo.element).attr("data-group");
            if (group !== undefined) {
                hasGroup = true;
            }
            ko.utils.domNodeDisposal.addDisposeCallback(componentInfo.element, function () {
                var vm = ko.dataFor($(componentInfo.element).children()[0]);
                //debug.print(`element ${vm.getIdent()} disposed`);
            });
            var labelText = params.hasOwnProperty("label") ? ko.unwrap(params.label) : this.defaultLabel; // "no label";
            var checked = params.hasOwnProperty("checked") ? ko.unwrap(params.checked) : false;
            this.downClass = params.hasOwnProperty("down") ? ko.unwrap(params.down) : this.downClass;
            this.upClass = params.hasOwnProperty("up") ? ko.unwrap(params.up) : this.upClass;
            var vm = new toggleViewModel(componentInfo.element, labelText, checked, this.downClass, this.upClass);
            if (hasGroup) {
                vm.addToGroup(group);
            }
            $(componentInfo.element).on("changeState", function (e, state) {
                //debugger;
                vm.isChecked(state);
            });
            //debug.print(`toggleViewModel ${vm.getIdent()} created`);
            return vm;
        };
        ;
        toggletag.prototype.getViewModel = function () {
            var _this = this;
            return {
                createViewModel: function (p, ci) { return _this.createViewModel(p, ci); }
            };
        };
        return toggletag;
    }(elementTag));
    fastnet.toggletag = toggletag;
    var checkboxTag = (function (_super) {
        __extends(checkboxTag, _super);
        function checkboxTag() {
            _super.call(this, "check-box", "fa-check-square-o", "fa-square-o", "no label");
        }
        return checkboxTag;
    }(toggletag));
    var radioButtonTag = (function (_super) {
        __extends(radioButtonTag, _super);
        function radioButtonTag() {
            _super.call(this, "radio-button", "fa-circle", "fa-circle-o", "no label");
        }
        return radioButtonTag;
    }(toggletag));
    var imageButtonTag = (function (_super) {
        __extends(imageButtonTag, _super);
        function imageButtonTag() {
            _super.call(this, "image-button", "fa-question", "fa-question fa-rotate-180");
        }
        return imageButtonTag;
    }(toggletag));
    var elementViewModel = (function () {
        function elementViewModel(element) {
            this.element = element;
            this.key = 0;
            this.key = elementViewModel.count++;
        }
        elementViewModel.init = function () {
            //ko.components.loaders.unshift(controlViewModel.controlLoader);
            elementViewModel.register(checkboxTag);
            elementViewModel.register(radioButtonTag);
            elementViewModel.register(imageButtonTag);
        };
        elementViewModel.register = function (c) {
            var et = new c();
            et.register();
        };
        elementViewModel.getVmForElement = function (element) {
            return ko.dataFor(element);
        };
        elementViewModel.prototype.handleEvent = function (eventname) {
        };
        elementViewModel.prototype.getIdent = function () {
            return this.element.tagName.toLowerCase() + "-" + this.key;
        };
        elementViewModel.prototype.dispose = function () {
            fastnet.debug.print("disposing " + this.getIdent());
        };
        elementViewModel.count = 0;
        elementViewModel.controlLoader = {
            // note: this loader allows the template to be modified based on the current viewModel
            // BUT I did not need this feature for the toggleViewModel based components.
            // I have left this here in c ase I do need it eventually ...
            // For the present this component loader is not itself loaded 
            loadComponent: function (componentName, config, callback) {
                function newCallback(definition) {
                    if (config.createTemplateForViewModel && definition.createViewModel && (!definition.template || !definition.template.length)) {
                        callback({
                            template: [],
                            createViewModel: function (params, componentInfo) {
                                var componentVM = definition.createViewModel.call(this, params, componentInfo);
                                var template = config.createTemplateForViewModel.call(this, componentVM, componentInfo);
                                if (typeof template === 'string') {
                                    template = ko.utils.parseHtmlFragment(template);
                                }
                                ko.virtualElements.setDomNodeChildren(componentInfo.element, template);
                                return componentVM;
                            }
                        });
                    }
                    else {
                        callback(definition);
                    }
                }
                ko.components.defaultLoader.loadComponent(componentName, config, newCallback);
            }
        };
        return elementViewModel;
    }());
    fastnet.elementViewModel = elementViewModel;
    var toggleViewModel = (function (_super) {
        __extends(toggleViewModel, _super);
        function toggleViewModel(element, labelText, checked, downClass, upClass) {
            var _this = this;
            _super.call(this, element);
            this.downClass = downClass;
            this.upClass = upClass;
            this.groupName = null;
            this.label = labelText !== null ? labelText.trim() : null;
            this.hasLabel = this.label !== null && this.label.length > 0;
            this.isChecked = ko.observable();
            this.isChecked.subscribe(function (newValue) {
                _this.setElementChecked(newValue);
            });
            this.isChecked(checked);
        }
        toggleViewModel.prototype.setElementChecked = function (value) {
            if (value) {
                $(this.element).attr("checked", "true");
            }
            else {
                $(this.element).removeAttr("checked");
            }
        };
        toggleViewModel.prototype.getClass = function () {
            var classes = "image fa  " + (this.isChecked() ? this.downClass : this.upClass) + " clickable";
            var tag = this.element.tagName.toLowerCase();
            if (tag === "radio-button") {
                fastnet.debug.print(this.element.tagName + " - " + this.getIdent() + ": checked is " + this.isChecked() + ", down class is " + this.downClass + " up class is " + this.upClass + ", result is " + classes);
            }
            return classes;
        };
        toggleViewModel.prototype.handleEvent = function (eventName) {
            var _this = this;
            var checkedState = this.isChecked();
            this.isChecked(!checkedState);
            if (this.groupName !== null && this.isChecked() && toggleViewModel.groups.containsKey(this.groupName)) {
                var list = toggleViewModel.groups.getValue(this.groupName);
                list.forEach(function (vm) {
                    if (vm !== _this) {
                        vm.isChecked(false);
                    }
                    return true;
                });
            }
        };
        toggleViewModel.prototype.dispose = function () {
            if (this.groupName !== null) {
                this.removeFromGroup();
            }
        };
        toggleViewModel.prototype.addToGroup = function (name) {
            this.groupName = name.toLowerCase();
            if (!toggleViewModel.groups.containsKey(this.groupName)) {
                toggleViewModel.groups.setValue(this.groupName, new collections.LinkedList());
            }
            toggleViewModel.groups.getValue(this.groupName).add(this);
        };
        toggleViewModel.prototype.removeFromGroup = function () {
            if (this.groupName !== null) {
                if (toggleViewModel.groups.containsKey(this.groupName)) {
                    var list = toggleViewModel.groups.getValue(this.groupName);
                    if (list.contains(this)) {
                        list.remove(this);
                        if (list.size() === 0) {
                            toggleViewModel.groups.remove(this.groupName);
                        }
                    }
                }
            }
        };
        //collections.Dictionary<Person, collections.LinkedList<Car>>();
        toggleViewModel.groups = new collections.Dictionary();
        return toggleViewModel;
    }(elementViewModel));
    fastnet.toggleViewModel = toggleViewModel;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=knockout.js.map
var fastnet;
(function (fastnet) {
    function toJQuery(para) {
        var jq = null;
        if (isJQuery(para)) {
            jq = para;
        }
        else if (para instanceof Element) {
            jq = $(para);
        }
        else {
            jq = $(para);
        }
        return jq;
    }
    fastnet.toJQuery = toJQuery;
    function isJQuery(object) {
        return object.jquery !== undefined && typeof object.jquery === "string";
    }
    fastnet.isJQuery = isJQuery;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=jqhelper.js.map
var fastnet;
(function (fastnet) {
    /**
     * Checks if the given argument is a receivedCommand
     */
    function isReceivedCommand(object) {
        return object.page !== undefined
            && object.command !== undefined
            && object.target !== undefined && object.target instanceof Element;
    }
    fastnet.isReceivedCommand = isReceivedCommand;
    // add to this list as required - enums are automatically combined as long as 
    // the numbers do not clash
    // value 0 is reserved
    // values 1 - 9999 available to apps
    // values 10000 and higher - reserved to system
    /**
     * Commands enum: each unique command has to have an enum
     * Add more as required in the range 1 - 9999
     * All others are reserved
     */
    (function (commands) {
        commands[commands["unknown"] = 0] = "unknown";
    })(fastnet.commands || (fastnet.commands = {}));
    var commands = fastnet.commands;
    /**
     * Object returned to a command listener contains details of the command that
     * received the click event;
     */
    var receivedCommand = (function () {
        function receivedCommand() {
        }
        receivedCommand.prototype.disable = function () {
            command.disable(this.command);
        };
        receivedCommand.prototype.enable = function () {
            command.enable(this.command);
        };
        return receivedCommand;
    }());
    fastnet.receivedCommand = receivedCommand;
    var command = (function () {
        function command() {
        }
        command.detach = function (root) {
            fastnet.toJQuery(root).off();
        };
        command.attach = function (root, listener) {
            fastnet.toJQuery(root)
                .find("[" + command.commandAttr + "]").addBack("[" + command.commandAttr + "]")
                .each(function (index, item) {
                $(item).off(command.eventName).on(command.eventName, function (e) {
                    var page = "";
                    var pageElem = $(e.target).closest("[" + command.pageAttr + "]");
                    if (pageElem.length > 0) {
                        page = $(pageElem).attr(command.pageAttr);
                    }
                    var cmdName = $(e.target).closest("[" + command.commandAttr + "]").attr(command.commandAttr);
                    var cmd = commands[cmdName];
                    if (cmd === undefined) {
                        cmd = commands.unknown;
                        fastnet.debug.print("found unknown command: page = " + page + ", commandName = " + cmdName);
                    }
                    var commandElement = $(e.target).closest("[" + command.commandAttr + "]").get(0);
                    var vm = null;
                    if (ko.components.isRegistered(commandElement.tagName.toLowerCase())) {
                        vm = ko.dataFor(e.target);
                        if (vm.handleEvent) {
                            vm.handleEvent(command.eventName);
                        }
                    }
                    if (listener !== null) {
                        e.stopPropagation();
                        e.preventDefault();
                        var dcl = new receivedCommand();
                        dcl.page = page;
                        dcl.command = cmd;
                        dcl.target = e.target;
                        dcl.commandElement = commandElement;
                        dcl.viewModel = vm;
                        dcl.isComponent = vm !== null;
                        dcl.commandName = cmdName;
                        listener(dcl);
                    }
                });
            });
        };
        command.enable = function (cmd) {
            var selector = "[" + command.commandAttr + "='" + commands[cmd] + "']"; // " [data-command]";
            $(selector).prop('disabled', false);
        };
        command.disable = function (cmd) {
            var selector = "[" + command.commandAttr + "='" + commands[cmd] + "']"; // " [data-command]";
            $(selector).prop('disabled', true);
        };
        command.setCheckboxTool = function (tool, checked) {
            var elem = fastnet.toJQuery(tool);
            if (checked) {
                elem.addClass("checked");
            }
            else {
                elem.removeClass("checked");
            }
        };
        command.commandAttr = "data-command";
        command.pageAttr = "data-page";
        command.eventName = "click.commands";
        return command;
    }());
    fastnet.command = command;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=commands.js.map
// namespace SignalR {
//     interface ConnectionOptions {
//         withCredentials?: boolean
//     }
// }
// export namespace SignalR {
//     export interface ConnectionOptions {
//         withCredentials?: boolean
//     }
// }
var fastnet;
(function (fastnet) {
    var logLevel;
    (function (logLevel) {
        logLevel[logLevel["debug"] = 1] = "debug";
        logLevel[logLevel["verbose"] = 2] = "verbose";
        logLevel[logLevel["information"] = 3] = "information";
        logLevel[logLevel["warning"] = 4] = "warning";
        logLevel[logLevel["error"] = 5] = "error";
        logLevel[logLevel["critical"] = 6] = "critical";
        logLevel[logLevel["none"] = 65536] = "none";
    })(logLevel || (logLevel = {}));
    var messageHub = (function () {
        function messageHub() {
            this.connection = null;
            this.url = "/";
            this.registry = [];
            this.handlerNumber = 0;
            this._printLogs = false;
        }
        Object.defineProperty(messageHub.prototype, "PrintLogs", {
            get: function () {
                return this._printLogs;
            },
            set: function (val) {
                this._printLogs = val;
            },
            enumerable: true,
            configurable: true
        });
        messageHub.prototype.stop = function () {
            var _this = this;
            $.each(this.registry, function (index1, register) {
                $.each(register.handlerList, function (index2, hf) {
                    _this.removeHandler(register.messageType, hf.id);
                });
            });
            this.connection.stop();
        };
        messageHub.prototype.start = function (siteUrl) {
            var _this = this;
            var onMessageReceived = function (m) {
                m.source = _this.url;
                var mt = m.messageType.toLowerCase();
                if (mt === "logmessage") {
                    if (_this.PrintLogs) {
                        var lm = m;
                        var level = logLevel[lm.level]; // lm.level[lm.level];
                        fastnet.debug.print(lm.source + " " + fastnet.date.toDateTimeSecString(lm.dateTimeUtc) + " " + level.substring(0, 4).toUpperCase() + " [" + lm.name + "]: " + lm.text);
                    }
                }
                else {
                    var mr = _this.registry[mt];
                    if (mr !== undefined) {
                        $.each(mr.handlerList, function (index, item) {
                            item.func(m);
                        });
                    }
                }
            };
            return new Promise(function (resolve, reject) {
                try {
                    //$.connection.hub.logging = true;
                    if (siteUrl !== undefined) {
                        _this.url = siteUrl;
                        var remoteHub = $.hubConnection(siteUrl + "/signalr");
                        var remoteHubProxy = remoteHub.createHubProxy('messageHub');
                        remoteHubProxy.on("messageReceived", function (m) {
                            onMessageReceived(m);
                        });
                        _this.connection = remoteHub;
                    }
                    else {
                        var hub = $.connection.messageHub;
                        _this.connection = $.connection.hub;
                        hub.client.messageReceived = function (m) {
                            onMessageReceived(m);
                        };
                    }
                    _this.connection.start({ withCredentials: false }).then(function () {
                        fastnet.debug.print(_this.url + " message hub connected");
                        resolve();
                    });
                }
                catch (xe) {
                    reject(xe);
                }
            });
        };
        messageHub.prototype.addHandler = function (messageType, handler) {
            messageType = messageType.toLowerCase();
            var mr = this.registry[messageType];
            if (mr === undefined) {
                mr = { messageType: messageType, handlerList: [] };
                this.registry[messageType] = mr;
            }
            var fn = ++this.handlerNumber;
            mr.handlerList.push({ func: handler, id: fn });
            return fn;
        };
        messageHub.prototype.removeHandler = function (messageType, handlerNumber) {
            messageType = messageType.toLowerCase();
            var mr = this.registry[messageType];
            if (mr !== undefined) {
                var result = -1;
                $.each(mr.handlerList, function (index, item) {
                    if (item.id === handlerNumber) {
                        result = index;
                        return false;
                    }
                });
                if (result >= 0) {
                    mr.handlerList.splice(result, 1);
                }
            }
        };
        return messageHub;
    }());
    fastnet.messageHub = messageHub;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=messagehub.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fastnet;
(function (fastnet) {
    (function (commands) {
        commands[commands["cancelcommand"] = 10100] = "cancelcommand";
        commands[commands["okcommand"] = 10101] = "okcommand";
    })(fastnet.commands || (fastnet.commands = {}));
    var commands = fastnet.commands;
    var baseForm = (function () {
        function baseForm(options) {
            this.options = null;
            this.commandHandler = null;
            var defaultOptions = {
                modal: true,
                caption: "(no caption)",
                classNames: null,
                onCommand: null,
                templateName: null,
                template: null,
                okButtonDisable: false,
                okButtonCaption: "OK",
                cancelButtonDisable: false,
                cancelButtonCaption: "Cancel",
                afterDisplay: null
            };
            this.options = $.extend({}, defaultOptions, options);
            var instance = baseForm.list.size();
            this.id = "fastnet-form-" + instance;
            baseForm.list.setValue(this.id, this);
        }
        Object.defineProperty(baseForm.prototype, "Id", {
            get: function () {
                return this.id;
            },
            enumerable: true,
            configurable: true
        });
        baseForm.prototype.display = function (onCommand) {
            var _this = this;
            var finaliseDisplay = function () {
                // **NB** the following code adding classnames was originally in 
                // openModal but it was losing the value of this when inside that method
                // in the case where the template was fetched asynchronously
                // I was never able to solve that so I've moved it here
                // if (this.options.classNames !== undefined && this.options.classNames.length > 0) {
                //     $(`#${this.id}`).addClass(this.options.classNames);
                // }
                if (fastnet.f$.isUndefinedOrNull(_this.options.classNames) === false && _this.options.classNames.length > 0) {
                    $("#" + _this.id).addClass(_this.options.classNames);
                }
                if (_this.options.afterDisplay !== null) {
                    _this.options.afterDisplay();
                }
                //var cp = new command();
                fastnet.command.attach("#" + _this.id, function (cmd) {
                    _this.onCommand(cmd);
                });
            };
            this.commandHandler = onCommand;
            if (this.options.modal) {
                this.openModal().then(function () {
                    fastnet.debug.print(_this.id);
                    finaliseDisplay();
                });
            }
            else {
                fastnet.debug.print("modeless form not implemented");
            }
        };
        /**
         * Detach all commands (i.e. data-command elements)
         * Remove the form from the DOM
         * Remove the forms container from the DOM if this is the last form
         */
        baseForm.prototype.close = function () {
            fastnet.command.detach("#" + this.id);
            baseForm.list.remove(this.id);
            $("#" + this.id).remove();
            if (baseForm.list.size() === 0) {
                $("body > #forms-container").hide();
            }
        };
        baseForm.prototype.getTemplate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                resolve("<div class='form-modal' id='" + _this.id + "'></div>");
            });
        };
        baseForm.prototype.ensureContainer = function () {
            var container = $("body > #forms-container");
            if (container.length === 0) {
                var template = "<div id='forms-container'></div>";
                $("body").append($(template));
                container = $("body > #forms-container");
            }
            container.show();
        };
        // protected modifyTemplate(template: string): string {
        //     return template;
        // }
        baseForm.prototype.openModal = function () {
            var _this = this;
            this.ensureContainer();
            return this.getTemplate().then(function (template) {
                // var modaltemplate = this.modifyTemplate(template);
                $("#forms-container").append($(template));
                // if (this.options.classNames !== undefined && this.options.classNames.length > 0) {
                //     $(`#${this.id}`).addClass(this.options.classNames);
                // }
                var element = $("#" + _this.id).get(0);
                _this.interactable = interact(element);
                _this.interactable.draggable({
                    inertia: true,
                    restrict: {
                        restriction: 'parent',
                        //endOnly: true,
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    },
                    autoScroll: true,
                    onmove: _this.dragMoveListener
                }).resizable({
                    edges: { left: true, right: true, bottom: true, top: true }
                }).on('resizemove', function (event) {
                    var target = event.target, x = (parseFloat(target.getAttribute('data-x')) || 0), y = (parseFloat(target.getAttribute('data-y')) || 0);
                    // update the element's style
                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';
                    // translate when resizing from top or left edges
                    x += event.deltaRect.left;
                    y += event.deltaRect.top;
                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)';
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                    //target.textContent = event.rect.width + '×' + event.rect.height;
                });
            });
        };
        baseForm.prototype.onCommand = function (cmd) {
            if (this.commandHandler !== null) {
                this.commandHandler(cmd);
            }
        };
        baseForm.prototype.dragMoveListener = function (event) {
            var target = event.target, 
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx, y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            // translate the element
            target.style.webkitTransform =
                target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px)';
            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        };
        baseForm.list = new collections.Dictionary();
        return baseForm;
    }());
    fastnet.baseForm = baseForm;
    // export class validatableModel {
    //     //public modelGroup: KnockoutValidationGroup = null;
    //     public isValid(): boolean {
    //         return this.modelGroup === null ? true : this.modelGroup.isValid();
    //     }
    // }
    /**
     * An interactive form without using browser windows
     * NB: needs forms.css
     */
    var form = (function (_super) {
        __extends(form, _super);
        function form(options) {
            _super.call(this, options);
            //private model: validatableModel = null;
            this.modelGroup = null;
            this.result = null;
            this.promise = null;
        }
        form.prototype.getTemplate = function () {
            var _this = this;
            var template = "<div class='form-modal' id='" + this.id + "'></div>";
            if (this.options.templateName !== null) {
                return fastnet.template.fetch(this.options.templateName).then(function (htmlFragment) {
                    return _this.buildForm(template, htmlFragment);
                });
            }
            else {
                return new Promise(function (resolve, reject) {
                    if (_this.options.template !== null) {
                        // use the provided template and combine it
                        resolve(_this.buildForm(template, _this.options.template));
                    }
                    else {
                        resolve(template);
                    }
                });
            }
            ;
        };
        /**
         * Show the form - promise returns when the form is closed
         * Both okcommand and cancelcommand automatically close the form
         * okcommand will be ignored if the form model is not valid
         * Promise parameter is true if okcommand, false if cancelcommand, or else null
         */
        form.prototype.show = function () {
            var _this = this;
            this.promise = new Promise(function (resolve, reject) {
                _this.resolver = resolve;
                _super.prototype.display.call(_this, function (cmd) {
                    var shouldClose = false;
                    switch (cmd.command) {
                        case commands.okcommand:
                            var canClose = true;
                            if (_this.modelGroup.isValid() === false) {
                                _this.modelGroup.errors.showAllMessages();
                                canClose = false;
                            }
                            if (canClose) {
                                _this.result = true;
                                shouldClose = true;
                            }
                            break;
                        case commands.cancelcommand:
                            _this.result = false;
                            shouldClose = true;
                            //this.close();
                            break;
                    }
                    if (cmd.command !== commands.okcommand || shouldClose === true) {
                        if (_this.options.onCommand === null) {
                            fastnet.debug.print("form " + _this.id + ": command " + cmd.commandName + ", no onCommand handler provided");
                        }
                        else {
                            _this.options.onCommand(cmd);
                        }
                    }
                    if (shouldClose) {
                        _this.close();
                    }
                });
            });
            return this.promise;
        };
        form.prototype.close = function () {
            fastnet.koHelper.unBind("#forms-container #" + this.Id);
            _super.prototype.close.call(this);
            this.resolver(this.result);
        };
        /**
         * Bind a datamodel to the form
         * Validation rules can, and should, be specified for model properties
         * The entire model will also be validated (unless validateWholeModel is set false)
         */
        form.prototype.bindModel = function (model, validateWholeModel) {
            if (validateWholeModel === void 0) { validateWholeModel = true; }
            //this.model = model;
            if (validateWholeModel) {
                this.modelGroup = ko.validatedObservable(model);
            }
            fastnet.koHelper.bind(model, "#forms-container #" + this.Id);
        };
        /**
         * return true if all the model properties are valid, or if validation has been turned off.
         */
        form.prototype.isValid = function () {
            return this.modelGroup === null ? true : this.modelGroup.isValid();
        };
        /**
         * returns an string array of current error messages
         * empty if there are no errors
         */
        form.prototype.getErrors = function () {
            if (this.modelGroup === null ? true : this.modelGroup.isValid()) {
                return [];
            }
            else {
                return this.modelGroup.errors();
            }
        };
        form.prototype.buildForm = function (baseTemplate, templateBody) {
            var title = null;
            var r = /<[a-z][\s\S]*>/;
            if (r.test(this.options.caption)) {
                title = $(this.options.caption);
            }
            else {
                title = $("<span></span>").text(this.options.caption);
            }
            var temp = $(baseTemplate).addClass("form")
                .append($("<div class='caption-bar'></div>"))
                .append($("<div class='form-body'></div>"))
                .append($("<div class='command-bar'><span data-command='okcommand' class='btn btn-confirm btn-small'>" + this.options.okButtonCaption + "</span><span data-command='cancelcommand' class='btn btn-cancel btn-small'>" + this.options.cancelButtonCaption + "</span></div>"));
            temp.find(".caption-bar").append(title);
            temp.find(".form-body").append($(templateBody));
            if (this.options.cancelButtonDisable) {
                temp.find("span[data-command='cancelcommand']").hide();
            }
            else if (this.options.cancelButtonCaption !== null) {
                temp.find("span[data-command='cancelcommand']").text(this.options.cancelButtonCaption);
            }
            if (this.options.okButtonDisable) {
                temp.find("span[data-command='okcommand']").hide();
            }
            else if (this.options.okButtonCaption !== null) {
                temp.find("span[data-command='okcommand']").text(this.options.okButtonCaption);
            }
            if (this.options.cancelButtonDisable && this.options.okButtonDisable) {
                temp.find(".command-bar").hide();
            }
            return temp.get(0).outerHTML;
        };
        return form;
    }(baseForm));
    fastnet.form = form;
    /**
     * Sets options for a messagebox
     * If both buttons are disabled, the message box must be closed in code
     */
    var messageBox = (function (_super) {
        __extends(messageBox, _super);
        //private caption: string = null;
        //private body: string = null;
        //private result: boolean = null;
        // private mbPromise: Promise<boolean> = null;
        // private mbResolver: (value?: boolean | Thenable<boolean>) => void;
        //private mbOptions: messageBoxOptions = null;
        //private closeHandler: (r: boolean) => void = null;
        /**
         * Creates a modal messagebox
         * @param caption the text to use in the caption bar
         * @param body the html for the body of the message box
         * @param options an optional instance of messageBoxOptions - controls appearance of messagebox buttons
         */
        function messageBox(options) {
            if (options === void 0) { options = { caption: "Message", template: "<span>no message body<span>" }; }
            _super.call(this, options);
            if (options.caption === undefined || options.caption === null) {
                options.caption = "Message";
            }
            if (options.template === undefined || options.template === null) {
                options.template = "<span>no message body<span>";
            }
            // this.caption = caption;
            // this.body = body;
            // this.mbOptions = $.extend({}, { modal: true }, options);
            // this.mbOptions.modal = true;
            // this.options = this.mbOptions;
        }
        messageBox.prototype.getTemplate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _super.prototype.getTemplate.call(_this).then(function (template) {
                    var temp = $(template).removeClass("form").addClass("message-box");
                    temp.find(".form-body").removeClass("form-body").addClass("message-body");
                    resolve(temp.get(0).outerHTML);
                });
            });
        };
        /**
         * Show the messagebox.
         * Promise<boolean> returns on any of okcommand, cancelcommand, or close()
         * Returned value is true if okcommand, false, if cancelcommand, or null if close()
         */
        messageBox.prototype.show = function () {
            var _this = this;
            this.promise = new Promise(function (resolve, reject) {
                _this.resolver = resolve;
                _super.prototype.display.call(_this, function (cmd) {
                    //var result = false;
                    switch (cmd.command) {
                        case commands.okcommand:
                            _this.result = true;
                            break;
                    }
                    _this.close();
                    //resolve(result);
                });
            });
            return this.promise;
        };
        return messageBox;
    }(form));
    fastnet.messageBox = messageBox;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=forms.js.map
