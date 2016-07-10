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