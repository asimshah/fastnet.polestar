/// <reference path="../package.d.ts" />
namespace fastnet {
    // *NB* this interface is an image of the C# class dataResult
    // that can be found in Fastnet.Core.Web which is a nuget package
    // (from the soultion Fastent.Packages)
    export class dataResult {
        success: boolean;
        message: string;
        exceptionMessage: string;
        data: any;
    }
    /**
     * @interface arguments for an ajax.Get call
     * @param url is the web api url to call
     * @param cache is optional. Set to false to prevent caching of the response
     */
    export interface ajaxGetArgs {
        /**
         * @property {string} url the web api url to call,
         * @property {boolean} cache set false to prevent the response from being cached, default is true
         */
        url: string;
        cache?: boolean;
    }

    export interface ajaxPostArgs {
        url: string;
        data: any;
    }
    export class ajax {
        private static rootUrl: string = "/";
        public static init() {
            var url = $('head base').attr('href');
            this.rootUrl = url;
            //debug.print(`rootUrl is ${this.rootUrl}`);
            $(document).ajaxError(this.ajaxError);
        }
        /**
         * Make a GET web api call using contentType "application/json" and returns a Promise<dataResult>
         * @param args Set to an object of type ajaxGetArgs
         * @param isFullUrl set true if args is the full url. By default this false, and args is prefixed with the url for the current site
         */
        public static Get(args: ajaxGetArgs, isFullUrl: boolean = false): Promise<dataResult> {
            var cache: boolean = true;
            if (args.cache !== undefined && args.cache === false) {
                cache = args.cache;
            }
            var url = isFullUrl ? args.url : this.rootUrl + args.url;
            return new Promise<dataResult>((resolve, reject) => {
                $.ajax({ url: url, contentType: "application/json", type: "GET", cache: cache })
                    .fail((jqXhr: JQueryXHR, textStatus: string, err: string) => {
                        debug.print(`GET Query: ${url} failed: status ${textStatus}, error ${err}`);
                        reject(err);
                    })
                    .done((data: any, textStatus: string, jqXhr: JQueryXHR) => {
                        var dr: dataResult = null;
                        if (data instanceof dataResult) {
                            // convert into a dataResult
                            dr = data;
                        } else {
                            dr = new dataResult();
                            dr.data = data;
                            dr.success = true;
                            dr.message = dr.exceptionMessage = null;
                        }
                        if (!data.success) {
                            debug.print(`GET Query: ${url} dataResult failed: message ${data.message}, exceptio ${data.exceptionMessage}`);
                        }
                        resolve(data);
                    });
            });
        }

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
        public static Post(args: ajaxPostArgs, isFullurl: boolean = false): Promise<dataResult> {
            var url = isFullurl ? args.url : this.rootUrl + args.url;
            return new Promise<dataResult>((resolve, reject) => {
                $.ajax({ url: url, contentType: "application/json; charset=UTF-8", type: "POST",  data: JSON.stringify(args.data) })
                    .fail((jqXhr: JQueryXHR, textStatus: string, err: string) => {
                        debug.print(`POST Query: ${url} failed: status ${textStatus}, error ${err}`);
                        reject(err);
                    })
                    .done((data: any, textStatus: string, jqXhr: JQueryXHR) => {
                        var dr: dataResult = null;
                        if (data === null || data instanceof dataResult) {
                            // convert into a dataResult
                            dr = data;
                        } else {
                            dr = new dataResult();
                            dr.data = data;
                            dr.success = true;
                            dr.message = dr.exceptionMessage = null;
                        }
                        if (!data.success) {
                            debug.print(`POST Query: ${url} dataResult failed: message ${data.message}, exceptio ${data.exceptionMessage}`);
                        }
                        resolve(data);
                    });
            });
            
        }
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
        private static ajaxError(event, jqXHR, settings, thrownError) {
            var errorMessage = `Internal error\nCall to "${settings.url}" failed: ${thrownError}`;
            debug.print(errorMessage);
            // how to call a system form here? alert()??
            alert(errorMessage);
        }

    }
}