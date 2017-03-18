/// <reference path="../package.d.ts" />
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
        return ajax;
    }());
    ajax.rootUrl = "/";
    fastnet.ajax = ajax;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=ajax.js.map