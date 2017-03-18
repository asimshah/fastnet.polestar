/// <reference path="../package.d.ts" />
namespace fastnet {
    export class template {
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
        public static fetch(templateName: string): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                ajax.Get({ url: `template/get/${templateName}` }).then((r: dataResult) => {
                    if (r.success) {
                        resolve(r.data);
                    } else {
                        reject(r.exceptionMessage);
                    }
                });
            });
        }
    }
}