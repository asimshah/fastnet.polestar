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