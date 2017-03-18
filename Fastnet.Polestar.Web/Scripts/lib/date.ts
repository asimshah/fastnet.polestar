/// <reference path="../package.d.ts" />

namespace fastnet {
    export class date {
        public static stdDateFormat = "DDMMMYYYY";
        public static stdDateTimeFormat = "DDMMMYYYY HH:mm";
        public static stdDateTimeSecFormat = "DDMMMYYYY HH:mm:ss";
        public static toDate(d: Date | moment.Moment | string): Date {                 
            if (d instanceof Date) {
                return d;
            } else {                                
                var md: moment.Moment;
                if (typeof d === "string") {
                    md = this.toMoment(d);
                } else {
                    md = <moment.Moment>d;

                }
                return md.toDate();
            }
        }
        public static toMoment(d: string | Date): moment.Moment {
            if (typeof d === "string") {
                if (d.length >= 19 && d.indexOf('T') === 10) {
                    // is an isoDate?
                    return moment(d);
                } else {
                    return moment(d, date.stdDateFormat);
                }
            } else {
                return moment(d);
            }
        }
        public static toMomentUtc(d: string | Date): moment.Moment {
            if (typeof d === "string") {
                if (d.length >= 19 && d.indexOf('T') === 10) {
                    // is an isoDate?
                    return moment.utc(d);
                } else {
                    return moment.utc(d, date.stdDateFormat);
                }
            } else {
                return moment.utc(d);
            }
        }
        public static toDateString(d: Date | moment.Moment | string): string {
            var md: moment.Moment;
            if (typeof d === "string") {
                md = this.toMoment(d);
            } else {
                if (d instanceof Date) {
                    md = moment(d);
                } else {
                    md = <moment.Moment>d;
                }
            }
            return md.format(date.stdDateFormat);
        }
        public static toDateTimeString(d: Date | moment.Moment | string): string {
            var md: moment.Moment;
            if (typeof d === "string") {
                md = this.toMoment(d);
            } else {
                if (d instanceof Date) {
                    md = moment(d);
                } else {
                    md = <moment.Moment>d;
                }
            }
            return md.format(date.stdDateTimeFormat);
        }
        public static toDateTimeSecString(d: Date | moment.Moment | string): string {
            var md: moment.Moment;
            if (typeof d === "string") {
                md = this.toMoment(d);
            } else {
                if (d instanceof Date) {
                    md = moment(d);
                } else {
                    md = <moment.Moment>d;
                }
            }
            return md.format(date.stdDateTimeSecFormat);
        }
    }
}
