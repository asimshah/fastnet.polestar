/// <reference path="../package.d.ts" />
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
        date.toMomentUtc = function (d) {
            if (typeof d === "string") {
                if (d.length >= 19 && d.indexOf('T') === 10) {
                    // is an isoDate?
                    return moment.utc(d);
                }
                else {
                    return moment.utc(d, date.stdDateFormat);
                }
            }
            else {
                return moment.utc(d);
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
        return date;
    }());
    date.stdDateFormat = "DDMMMYYYY";
    date.stdDateTimeFormat = "DDMMMYYYY HH:mm";
    date.stdDateTimeSecFormat = "DDMMMYYYY HH:mm:ss";
    fastnet.date = date;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=date.js.map