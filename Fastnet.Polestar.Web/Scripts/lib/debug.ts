/// <reference path="../package.d.ts" />
namespace fastnet {
    //
    export class debug {
        //
        public static routeMessagesToVisualStudio = true;
        public static print(message: string) {
            if (debug.routeMessagesToVisualStudio) {
                if (window.hasOwnProperty('Debug')) {
                    var x = window['Debug'];
                    x.writeln(`[browser] ${message}`);
                } else {
                    console.log(message);
                }
            }
            else {
                console.log(message);
            }
        }
    }
}