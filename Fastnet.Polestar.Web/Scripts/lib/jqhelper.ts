/// <reference path="../package.d.ts" />
namespace fastnet {
    export function toJQuery(para: JQuery | Element | string): JQuery {
        var jq: JQuery = null;
        if (isJQuery(para)) {
            jq = para;
        } else if (para instanceof Element) {
            jq = $(para);
        } else {
            jq = $(para);
        }
        return jq;
    }
    export function isJQuery(object: any): object is JQuery {
        return object.jquery !== undefined && typeof object.jquery === "string";
    }
}