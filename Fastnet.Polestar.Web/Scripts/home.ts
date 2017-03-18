/// <reference path="package.d.ts" />
/// <reference path="../transfermodels/index.d.ts" />

namespace fastnet {
    (() => {
        $(function () {
            var start = new app();
            start.init();
        });
    })();
    export enum commands {
        uploadWebframeCommand = 100,
        uploadPolestarCommand,
        upgradeSiteCommand,
        deleteSiteCommand,
        createSiteCommand,
        backupSiteCommand
    }
    export class app {
        private signalRUnavailable = true;
        private satellites: server.satellite[];
        private homeContainer = new koContainer<homePageModel>();
        //private messageHub: messageHub = null;
        public init() {
            koHelper.initialiseValidation();
            koHelper.addStandardAdditionalValidationRules();
            //this.messageHub = new messageHub();
            //this.messageHub.PrintLogs = true;
            if (this.signalRUnavailable) { // Note: this 'should' be temporary, i.e. until signalR becomes available again
                template.fetch("home").then((htmlFragment: string) => {
                    $("#pageContainer").off().empty().append($(htmlFragment));
                    koHelper.bind(this.homeContainer, ".home-page");
                    this.start();
                });
            } else {
                template.fetch("home").then((htmlFragment: string) => {
                    $("#pageContainer").off().empty().append($(htmlFragment));
                    koHelper.bind(this.homeContainer, ".home-page");
                    this.start();
                });
                //this.messageHub.start().then(() => {

                //});
            }
        }
        public start() {
            var busy = new busyIndicator();
            busy.block("Waiting for satellites ...");
            var request: ajaxGetArgs = { url: "cmd/satellite/list", cache: false };
            ajax.Get(request).then((r: dataResult) => {
                this.satellites = r.data;
                this.homeContainer.model(new homePageModel(this.satellites));
                var promises: Promise<dataResult>[] = [];
                ko.utils.arrayForEach(this.homeContainer.model().satellites(), (s, index) => {
                    promises.push(this.getSatelliteInformation(s));
                });
                Promise.all(promises)
                    .then(() => {
                        busy.unBlock();
                        debug.print("all satellites have replied");
                        this.attachSatelliteListCommands();
                        //command.attach(".satellite-list", (cmd) => {
                        //    this.handleCommands(cmd);
                        //});
                    });
            });
        }
        private attachSatelliteListCommands() {
            command.attach(".satellite-list", (cmd) => {
                this.handleCommands(cmd);
            });
        }
        private handleCommands(cmd: receivedCommand): void {
            var url = $(cmd.target).closest('.satellite').attr('data-satelliteurl');
            //debug.print(`received command ${cmd.commandName} for ${url}`);
            var selectedSatellite = this.homeContainer.model().findSatellite(url);
            //var polestar;
            switch (cmd.command) {
                case commands.uploadPolestarCommand:
                    //polestar = true;
                    var uploader = new webframeUploader(selectedSatellite);
                    uploader.start(true).then(() => {
                        this.refreshSatellite(selectedSatellite);
                    });
                    break;
                case commands.uploadWebframeCommand:
                    var uploader = new webframeUploader(selectedSatellite);
                    uploader.start(false).then(() => {
                        this.refreshSatellite(selectedSatellite);
                    });
                    break;
                case commands.createSiteCommand:
                    var wh = new webframeHelper(selectedSatellite);
                    wh.create2().then((r) => {
                        if (r) {
                            this.refreshSatellite(selectedSatellite);
                        }
                    });
                    break;
                case commands.upgradeSiteCommand:
                case commands.deleteSiteCommand:
                    var siteName = $(cmd.target).closest('.site').attr('data-site');
                    var sm = selectedSatellite.findSite(siteName);
                    var wh = new webframeHelper(selectedSatellite);
                    if (cmd.command === commands.deleteSiteCommand) {
                        wh.delete(sm).then((r) => {
                            if (r) {
                                this.refreshSatellite(selectedSatellite);
                            }
                        });
                    } else {
                        wh.upgrade(sm).then((r) => {
                            if (r) {
                                this.refreshSatellite(selectedSatellite);
                            }
                        });
                    }
                    break;
                case commands.backupSiteCommand:
                    var siteName = $(cmd.target).closest('.site').attr('data-site');
                    var sm = selectedSatellite.findSite(siteName);
                    var wh = new webframeHelper(selectedSatellite);
                    wh.backup(sm).then(() => { });
                    break;
                default:
                    debug.print(`command ${cmd.commandName} for satellite ${selectedSatellite.url} not implemented`);
                    break;
            }
        }
        private refreshSatellite(s: satelliteModel): Promise<void> {
            return this.getSatelliteInformation(s).then(() => {
                this.attachSatelliteListCommands();
            });
        }
        private getSatelliteInformation(s: satelliteModel): Promise<dataResult> {
            var url = s.url + "/";
            if (s.version === 0.0) {
                url += "cmd/locationinfo";
            } else {
                url += "cmd/satellite/current";
            }
            return ajax.Get({ url: url, cache: false }, true).then((result) => {
                if (s.version === 0.0) {
                    var data00: server.deploymentInfo = result.data;
                    s.machine("unknown");
                    s.webframeIsUploaded(data00.deploymentIsAvailable);
                    s.uploadedWebframeVersion(new versionModel(data00.version));
                    s.isReady(true);
                } else {
                    var data: server.satellite = result.data;
                    var rs = new satelliteModel(data, this.homeContainer.model().webframeSourceSatellite());
                    rs.isReady(true);
                    this.homeContainer.model().satellites.replace(s, rs);
                }
                return result;
            }, (err) => {
                if (err.trim() === "") {
                    err = "No failure reason available";
                }
                s.failureReason(`${url} failed: ${err}`);
                s.hasAccessFailed(true);
                s.isReady(true);
            });
        }
    }
    abstract class webframeActions {
        //protected remoteMessageHub: messageHub = null;
        protected logHandler: number = 0;
        protected satellite: satelliteModel = null;
        //protected closeRemoteLog() {
        //    this.remoteMessageHub.PrintLogs = false;
        //}
        //protected logRemoteMessages(): Promise<void> {
        //    this.remoteMessageHub = new messageHub();
        //    return this.remoteMessageHub.start(this.satellite.url).then(() => {
        //        this.remoteMessageHub.PrintLogs = true;
        //    });
        //}
    }
    class webframeHelper extends webframeActions {
        //private homeMessageHub: messageHub = null;
        constructor(/*messageHub: messageHub,*/ satellite: satelliteModel) {
            super();
            //this.homeMessageHub = messageHub;
            this.satellite = satellite;
        }
        public create2(): Promise<boolean> {
            var nsm = new newSiteModel(this.satellite);
            return new Promise<boolean>((resolve, reject) => {
                let csform = new createSiteForm(this.satellite);
                csform.show(nsm).then((arg) => {
                    if (arg) {
                        debug.print("ok command");
                        this.createStep2(nsm).then(() => {
                            debug.print("new site created");
                            resolve(true);
                        });
                    } else {
                        debug.print("cancel command");
                        resolve(false);
                    }
                });
            });
        }
        //public create(): Promise<boolean> {
        //    var nsm = new newSiteModel(this.satellite);
        //    return new Promise<boolean>((resolve, reject) => {
        //        var caption: string = `New Webframe site on ${this.satellite.url}`;
        //        // THIS WILL NOT WORK WITH LATEST FORM.TS
        //        var csf = new form({
        //            onCommand: (cmd) => {
        //                switch (cmd.command) {
        //                    case commands.cancelcommand:
        //                        resolve(false);
        //                        break;
        //                    case commands.okcommand:
        //                        this.createStep2(nsm).then(() => {
        //                            debug.print("new site created");
        //                            resolve(true);
        //                        });
        //                        break;
        //                }
        //            },
        //            caption: caption,
        //            templateName: "createWebframeSite",
        //            afterDisplay: () => {
        //                //command.disable(commands.okcommand);
        //                csf.bindModel(nsm);
        //            }
        //        });
        //        csf.show();
        //    });
        //}
        public delete(site: siteModel): Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                var mb = new messageBox({
                    caption: `${this.satellite.url}: Confirm`,
                    template: `<div>Are you sure you want to delete site ${site.name}?</div>`,
                    classNames: "confirm-box",
                    okButtonCaption: "Yes",
                    cancelButtonCaption: "No"
                });
                mb.show().then((r) => {
                    if (r) {
                        debug.print("delete confirmed");
                        this.deleteStep2(site).then(() => {
                            //this.closeRemoteLog();
                            resolve(true);
                        });
                    } else {
                        debug.print("delete cancelled");
                        resolve(false);
                    }
                });

            });
        }
        public upgrade(site: siteModel): Promise<boolean> {
            var bi = new busyIndicator();
            bi.block(`Upgrading site ${site.name} on ${this.satellite.url}`);
            return new Promise<boolean>((resolve) => {
                var url = this.satellite.url + `/cmd/upgrade/site/${site.name}`;
                return ajax.Get({ url: url, cache: false }, true).then((r) => {
                    //this.closeRemoteLog();
                    resolve(true);
                    bi.unBlock();
                });
                //return this.logRemoteMessages().then(() => {

                //});
            });

        }
        public backup(site: siteModel): Promise<void> {
            var bi = new busyIndicator();
            bi.block(`Backup of site ${site.name} on ${this.satellite.url}`);
            return new Promise<void>((resolve) => {
                var url = this.satellite.url + `/cmd/backup/site/${site.name}`;
                return ajax.Get({ url: url, cache: false }, true).then((r) => {
                    //this.closeRemoteLog();
                    resolve();
                    bi.unBlock();
                });
                //return this.logRemoteMessages().then(() => {

                //});
            });
        }

        private deleteStep2(site: siteModel): Promise<void> {
            var bi = new busyIndicator();
            bi.block(`Deleting site ${site.name} on ${this.satellite.url}`);
            var url = this.satellite.url + `/cmd/delete/site/${site.name}`;
            return ajax.Get({ url: url }, true).then((r) => {
                //this.closeRemoteLog();
                bi.unBlock();
            });
            //return this.logRemoteMessages().then((resolve) => {

            //});
        }
        private createStep2(nsm: newSiteModel): Promise<void> {
            var newSite: server.newSite = {
                name: nsm.name(),
                url: nsm.url(),
                fromAddress: nsm.fromAddress(),
                customisation: nsm.customisation(),
                legacyDatabase: nsm.legacyDatabase()
            };
            var bi = new busyIndicator();
            bi.block(`Creating site ${nsm.name()} on ${this.satellite.url}`);
            var url = this.satellite.url + "/cmd/create/site";
            return ajax.Post({ url: url, data: newSite }, true).then(() => {
                //this.closeRemoteLog();
                bi.unBlock();
            });
            //return this.logRemoteMessages().then(() => {

            //});
        }

    }
    class webframeUploader extends webframeActions {
        private messages: { type: string, handlerNumber: number }[] = [
            { type: "zipprogress", handlerNumber: null },
            { type: "zipFinished", handlerNumber: null },
            { type: "transferInfo", handlerNumber: null },
            { type: "unzipFinished", handlerNumber: null },
            { type: "uploadFinished", handlerNumber: null }
        ];
        private mb: messageBox = null;
        //private messageHub: messageHub = null;
        //private satellite: satelliteModel = null;
        private promiseResolver: (value?: void | Thenable<void>) => void = null;
        constructor(/*messageHub: messageHub,*/ uploadTo: satelliteModel) {
            super();
            //this.messageHub = messageHub;
            this.satellite = uploadTo;
        }
        public start(uploadPolestar: boolean): Promise<void> {
            var polestar = uploadPolestar;// == undefined || uploadPolestar == null ? false : true;
            return new Promise<void>((resolve, reject) => {
                this.promiseResolver = resolve;
                //this.addMessageHandlers();
                var messageBody = this.getProgressFormTemplate();
                var temp = $(messageBody);
                temp.find('.subject').text(`Upload to: ${this.satellite.url}`);
                var caption = polestar ? "Polestar Upload" : "Webframe Upload";
                this.mb = new messageBox({
                    caption: caption, template: temp.get(0).outerHTML,
                    classNames: "upload", //okButtonDisable: true, cancelButtonDisable: true,
                    afterDisplay: () => {
                        if (!polestar) {
                            $('.progress-form').find('.stage').text("Compressing webframe files ...");
                        }
                    }
                });
                this.mb.show().then((r: boolean) => { });
                var cmd = polestar ? "polestardeployment" : "webframedeployment";

                var url = `cmd/${cmd}/start?url=${encodeURI(this.satellite.url)}`;
                return ajax.Get({ url: url, cache: false }).then((r: dataResult) => {
                    var uploadInfo: server.uploadInfo = r.data;
                    $('.progress-form').find('.stage').text(`Uploading in ${uploadInfo.totalChunks} blocks`);
                    this.uploadBlock(uploadInfo);
                });
            });
            //return this.logRemoteMessages().then(() => {

            //});
        }
        private uploadBlock(uploadInfo: server.uploadInfo): void {
            if (uploadInfo.chunkNumber < uploadInfo.totalChunks) {
                //debug.print(`File: ${uploadInfo.filename}, uploaded chunk ${uploadInfo.chunkNumber} ...`);
                let url = `cmd/upload/${uploadInfo.key}/${uploadInfo.chunkNumber}/${uploadInfo.chunkSize}?url=${encodeURI(uploadInfo.satellite.url)}&file=${encodeURI(uploadInfo.filename)}`;
                ajax.Get({ url: url, cache: false }).then((r: dataResult) => {
                    //debug.print(`    ...File: ${uploadInfo.filename}, uploaded chunk ${uploadInfo.chunkNumber}`);
                    uploadInfo.chunkNumber++;
                    $('.progress-form').find('.progress').text(`transferred ${uploadInfo.chunkNumber}/${uploadInfo.totalChunks}`);
                    this.uploadBlock(uploadInfo);
                });
            } else {
                if (!uploadInfo.isPolestarUpload) {
                    $('.progress-form').find('.progress').text("");
                    $('.progress-form').find('.stage').text("Expanding webframe files ...");
                }
                let url = `cmd/finaliseupload/${uploadInfo.isPolestarUpload}/${uploadInfo.key}?url=${encodeURI(uploadInfo.satellite.url)}`;
                ajax.Get({ url: url, cache: false }).then((r: dataResult) => {
                    //debug.print(`File: ${uploadInfo.filename}, uploaded finished`);
                    this.mb.close();
                    //this.removeMessageHandlers();
                    this.promiseResolver();
                });
            }
        }
        private handleMessages(m: messageBase) {
            switch (m.messageType.toLowerCase()) {
                case "zipprogress":
                    var zp = <server.zipProgress>m;
                    var progress = `${zp.completed}/${zp.grossTotal}`;
                    $('.progress-form').find('.stage').text(zp.direction + ":");
                    $('.progress-form').find('.progress').text(progress);
                    break;
                //case "transferinfo":
                //    var ft = <server.transferInfo>m;
                //    var progress = `${ft.chunkNumber}/${ft.totalChunks}`;
                //    $('.progress-form').find('.stage').text("Transferring: ");
                //    $('.progress-form').find('.progress').text(progress);
                //    break;
                case "zipfinished":
                    var zf = <server.zipFinished>m;
                    $('.progress-form').find('.stage').text("Zip finished");
                    $('.progress-form').find('.progress').text("");
                    break;
                case "unzipfinished":
                    var zf = <server.zipFinished>m;
                    $('.progress-form').find('.stage').text("unZip finished");
                    $('.progress-form').find('.progress').text("");
                    break;
                //case "uploadfinished":
                //    this.mb.close();
                //    this.removeMessageHandlers();
                //    this.promiseResolver();
                //    break;
            }
        };
        //private removeMessageHandlers() {
        //    this.messages.forEach((m) => {
        //        this.messageHub.removeHandler(m.type, m.handlerNumber);
        //    });
        //    //this.closeRemoteLog();
        //}
        //private addMessageHandlers() {
        //    this.messages.forEach((m) => {
        //        m.handlerNumber = this.messageHub.addHandler(m.type, (m) => { this.handleMessages(m); });
        //    });
        //}
        private getProgressFormTemplate(): string {
            var template =
                `<div class='progress-form'>
                    <div>
                        <span class='subject'></span>
                    </div>
                    <div>
                        <div class='stage'></div>
                        <div class='progress'></div>
                    </div>
                </div>`;
            return template;
        }
    }
    class newSiteModel {
        public name: KnockoutObservable<string>;
        public url: KnockoutObservable<string>;
        public urlRequired: boolean;
        public fromAddress: KnockoutObservable<string>;
        public customisation: KnockoutObservable<string>;
        public customisationHelp: KnockoutObservable<string>;
        public legacyDatabase: KnockoutObservable<string>;
        constructor(satellite: satelliteModel) {
            try {
                var existingNames: string[] = [];
                $.each(satellite.sites(), (index, item) => {
                    if (item.isWebframe) {
                        existingNames.push(item.name);
                    }
                });
                this.urlRequired = satellite.type === server.SatelliteType.Live || satellite.type === server.SatelliteType.Test;
                this.name = ko.observable<string>();
                this.url = ko.observable<string>();
                this.fromAddress = ko.observable<string>();
                this.customisation = ko.observable<string>();
                this.customisationHelp = ko.observable<string>();
                this.legacyDatabase = ko.observable<string>();

                this.name.extend({ required: { message: "Provide a name for the site" } })
                    .extend({ pattern: { params: /^[a-z0-9]+$/i, message: "Site names cannot have spaces or punctuation characters" } })
                    .extend({
                        exclusionList: {
                            params: existingNames,// ["abc", "def"],
                            message: "A site with this name already exists"
                        }
                    });
                if (this.urlRequired) {
                    this.url.extend({ required: { message: "Provide a url in the form something.domain.tld" } })
                        .extend({ pattern: { params: /^[a-z][a-z\.-]+\.[a-z]+[a-z]$/i, message: "This is not a valid url" } })
                        .extend({
                            exclusionList: {
                                params: ["satellite.webframe.co.uk", "satellite.test.webframe.co.uk",
                                    "polaris.webframe.co.uk", "polaris.test.webframe.co.uk"],
                                message: "This url is reserved"
                            }
                        });
                    if (satellite.type === server.SatelliteType.Test) {
                        this.url.extend({
                            validation: {
                                validator: (val: string) => {
                                    return val.endsWith("test.webframe.co.uk") || val.endsWith("demo.webframe.co.uk");
                                },
                                message: 'Url must end with either test.webframe.co.uk or demo.webframe.co.uk'
                            }
                        });
                    }
                }
                this.fromAddress.extend({ required: { message: "Provide an email to use as a \"from\" address" } })
                    //.extend({ email: { message: "This is not a valid email address" } });
                    .extend({ email: true });

                this.customisation.subscribe((nv) => {
                    if (nv.trim().length === 0) {
                        this.customisationHelp("");
                    } else {
                        this.customisationHelp(`Customisation file will be customisation.${nv}.json`);
                    }
                });

                // set to empty string so that these fields are in error when the form opens
                //this.name("");
                //this.url("");
                //this.fromAddress("");
            } catch (xe) {
                debugger;
            }
        }
    }
    class siteModel {
        public name: string;
        public host: string;
        public port: number;
        public path: string;
        public poolName: string;
        public databaseNames: string[];
        public isWebframe: boolean;
        public isPaused: boolean;
        public isUpgradeable: boolean;
        public version: KnockoutObservable<versionModel>;
        constructor(site: server.site) {
            this.name = site.name;
            this.host = site.name;
            this.port = site.port;
            this.poolName = site.poolName;
            this.databaseNames = site.databaseNames;
            this.isWebframe = site.isWebframe;
            this.isPaused = site.isPaused;
            this.isUpgradeable = site.isUpgradeable;
            this.version = ko.observable<versionModel>(new versionModel(site.version));
        }
    }
    class versionModel {
        public major: KnockoutObservable<number>;
        public minor: KnockoutObservable<number>;
        public revision: KnockoutObservable<number>;
        public build: KnockoutObservable<number>;
        constructor(v: server.version) {
            if (v !== null) {
                this.major = ko.observable<number>(v.major);
                this.minor = ko.observable<number>(v.minor);
                this.build = ko.observable<number>(v.build);
                this.revision = ko.observable<number>(v.revision);
            } else {
                this.major = ko.observable<number>(0);
                this.minor = ko.observable<number>(0);
                this.build = ko.observable<number>(0);
                this.revision = ko.observable<number>(0);
            }
        }
        public toString(): string {
            return `${this.major()}.${this.minor()}.${this.build()}.${this.revision()}`;
        }
        public compare(r: versionModel): number {
            //var r = new versionModel(another);
            var l = this;
            if (l.major() > r.major()) {
                return 1;
            } else if (l.major() < r.major()) {
                return -1;
            } else {
                if (l.minor() > r.minor()) {
                    return 1;
                } else if (l.minor() < r.minor()) {
                    return -1;
                } else {
                    if (l.build() > r.build()) {
                        return 1;
                    } else if (l.build() < r.build()) {
                        return -1;
                    } else {
                        if (l.revision() > r.revision()) {
                            return 1;
                        } else if (l.revision() < r.revision()) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        }
    }
    class satelliteModel {
        public active: boolean = null;
        public assemblyVersion: string = null;
        public distributionFolder: string;
        public isWebframeSource: boolean;
        public machine: KnockoutObservable<string>;
        public name: string = null;
        public publishingFolder: string;
        public siteRootFolder: string;
        public upgradeRootFolder: string;
        public url: string = null;
        public version: number = null;
        public type: server.SatelliteType;
        public webframeIsUploaded: KnockoutObservable<boolean>;
        public webframeMarkerDll: string;
        public webframeRootDrive: string;
        public publishedWebframeVersion: KnockoutObservable<versionModel>; // only meaningful on a source satellite
        public uploadedWebframeVersion: KnockoutObservable<versionModel>;
        public newVersionWaitingUpload: KnockoutObservable<boolean>;
        public sites: KnockoutObservableArray<siteModel>;
        public isReady: KnockoutObservable<boolean>;
        public hasAccessFailed: KnockoutObservable<boolean>;
        public failureReason: KnockoutObservable<string>;
        // sourceSatellite == null when this is the sourceSatellite
        constructor(s: server.satellite, sourceSatellite: satelliteModel) {
            this.name = s.name;
            this.assemblyVersion = s.assemblyVersion === undefined || s.assemblyVersion === null ? "0.0.0" : s.assemblyVersion;
            this.url = s.url;
            this.active = s.active;
            this.version = s.version;
            this.type = s.type;
            this.isWebframeSource = s.isWebframeSource;
            this.publishedWebframeVersion = ko.observable<versionModel>(new versionModel(s.latestAvailableWebframeVersion));
            this.publishingFolder = s.publishingFolder;
            this.distributionFolder = s.distributionFolder;
            this.siteRootFolder = s.siteRootFolder;
            this.upgradeRootFolder = s.upgradeRootFolder;
            this.webframeMarkerDll = s.webframeMarkerDll;
            this.webframeRootDrive = s.webframeRootDrive;
            this.machine = ko.observable<string>((s.machine === null || s.machine.trim() === "") ? "<unknown machine>" : s.machine);
            this.webframeIsUploaded = ko.observable<boolean>(s.webframeIsUploaded);
            this.uploadedWebframeVersion = ko.observable<versionModel>();
            this.isReady = ko.observable<boolean>(false);
            this.hasAccessFailed = ko.observable<boolean>(false);
            this.failureReason = ko.observable<string>("");
            this.newVersionWaitingUpload = ko.observable<boolean>(false);
            if (s.uploadedWebframeVersion === null) {
                this.uploadedWebframeVersion(new versionModel({ major: 0, minor: 0, revision: 0, build: 0 }));
            } else {
                this.uploadedWebframeVersion(new versionModel(s.uploadedWebframeVersion));
            }
            this.sites = ko.observableArray<siteModel>();
            //`${this.major()}.${this.minor()}.${this.revision()}.${this.build()}`;
            $.each(s.sites, (index, s) => {
                var sm = new siteModel(s);
                if (s.isWebframe) {
                    debug.print(`${this.name} publishedWebframeVersion = ${this.publishedWebframeVersion()} uploadedWebframeVersion = ${this.uploadedWebframeVersion()} :::: ${s.name} ::: s values: isUpgradeable = ${s.isUpgradeable}, version =  ${s.version.major}.${s.version.minor}.${s.version.build}.${s.version.revision} :: sm values: isUpgradeable = ${sm.isUpgradeable}, version = ${sm.version()}`);
                }
                this.sites.push(sm);
            });
            if (this.isWebframeSource === false && this.uploadedWebframeVersion().compare(sourceSatellite.publishedWebframeVersion()) < 0) {
                this.newVersionWaitingUpload(true);
            }
        }
        public findSite(name: string): siteModel {
            var site: siteModel = null;
            ko.utils.arrayForEach(this.sites(), (item, index) => {
                if (item.name === name) {
                    site = item;
                    return false;
                }
            });
            return site;
        }
    }
    class homePageModel {
        public webframeSourceSatellite: KnockoutObservable<satelliteModel> = null;
        //public latestAvailableWebframeVersion: server.version;
        public satellites: KnockoutObservableArray<satelliteModel>;
        constructor(satelliteList: server.satellite[]) {
            var wfSource = satelliteList.find((s1) => { return s1.isWebframeSource; });
            if (wfSource !== null) {
                this.webframeSourceSatellite = ko.observable<satelliteModel>(new satelliteModel(wfSource, null));
            }
            this.satellites = ko.observableArray<satelliteModel>();
            $.each<server.satellite>(satelliteList, (index, s) => {
                var sm = new satelliteModel(s, this.webframeSourceSatellite());
                if (!s.isWebframeSource) { // 
                    this.satellites.push(sm);
                }
            });
        }
        public findSatellite(url: string): satelliteModel {
            var satellite: satelliteModel = null;
            ko.utils.arrayForEach(this.satellites(), (item, index) => {
                if (item.url === url) {
                    satellite = item;
                    return false;
                }
            });
            return satellite;
        }
    }
    class createSiteForm {
        protected satellite: satelliteModel = null;
        private form: form = null;
        private resolver: (value?: boolean | Thenable<boolean>) => void;
        constructor(sm: satelliteModel) {
            this.satellite = sm;
        }
        public show(model: newSiteModel): Promise<boolean> {
            let options: formOptions = {
                sizeRatio: 0.85,
                modal: true,
                caption: `New Webframe site on ${this.satellite.url}`,
                okButtonCaption: "Create site",
                templateName: "createWebframeSite",
                afterDisplay: () => {
                    this.form.bindModel(model);
                }
            };
            options.onCommand = (cmd) => this.handleCommands(cmd);
            return new Promise<boolean>((resolve) => {
                this.resolver = resolve;
                this.form = new form(options);
                this.form.show().then((r) => {
                    this.resolver(r);
                });
            });
        }
        private handleCommands(cmd: receivedCommand): void {
            switch (cmd.command) {
                //case commands
            }
        }
    }
}