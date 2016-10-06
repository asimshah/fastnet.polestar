//interface Array<T> {
//    find(predicate: (search: T) => boolean): T;
//}
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fastnet;
(function (fastnet) {
    (function () {
        $(function () {
            var start = new app();
            start.init();
        });
    })();
    (function (commands) {
        commands[commands["uploadWebframeCommand"] = 100] = "uploadWebframeCommand";
        commands[commands["uploadPolestarCommand"] = 101] = "uploadPolestarCommand";
        commands[commands["upgradeSiteCommand"] = 102] = "upgradeSiteCommand";
        commands[commands["deleteSiteCommand"] = 103] = "deleteSiteCommand";
        commands[commands["createSiteCommand"] = 104] = "createSiteCommand";
        commands[commands["backupSiteCommand"] = 105] = "backupSiteCommand";
    })(fastnet.commands || (fastnet.commands = {}));
    var commands = fastnet.commands;
    var app = (function () {
        function app() {
            this.signalRUnavailable = true;
            this.homeContainer = new fastnet.koContainer();
        }
        //private messageHub: messageHub = null;
        app.prototype.init = function () {
            var _this = this;
            fastnet.koHelper.initialiseValidation();
            fastnet.koHelper.addStandardAdditionalValidationRules();
            //this.messageHub = new messageHub();
            //this.messageHub.PrintLogs = true;
            if (this.signalRUnavailable) {
                fastnet.template.fetch("home").then(function (htmlFragment) {
                    $("#pageContainer").off().empty().append($(htmlFragment));
                    fastnet.koHelper.bind(_this.homeContainer, ".home-page");
                    _this.start();
                });
            }
            else {
                fastnet.template.fetch("home").then(function (htmlFragment) {
                    $("#pageContainer").off().empty().append($(htmlFragment));
                    fastnet.koHelper.bind(_this.homeContainer, ".home-page");
                    _this.start();
                });
            }
        };
        app.prototype.start = function () {
            var _this = this;
            var busy = new fastnet.busyIndicator();
            busy.block("Waiting for satellites ...");
            var request = { url: "cmd/satellite/list", cache: false };
            fastnet.ajax.Get(request).then(function (r) {
                _this.satellites = r.data;
                _this.homeContainer.model(new homePageModel(_this.satellites));
                var promises = [];
                ko.utils.arrayForEach(_this.homeContainer.model().satellites(), function (s, index) {
                    promises.push(_this.getSatelliteInformation(s));
                });
                Promise.all(promises)
                    .then(function () {
                    busy.unBlock();
                    fastnet.debug.print("all satellites have replied");
                    _this.attachSatelliteListCommands();
                    //command.attach(".satellite-list", (cmd) => {
                    //    this.handleCommands(cmd);
                    //});
                });
            });
        };
        app.prototype.attachSatelliteListCommands = function () {
            var _this = this;
            fastnet.command.attach(".satellite-list", function (cmd) {
                _this.handleCommands(cmd);
            });
        };
        app.prototype.handleCommands = function (cmd) {
            var _this = this;
            var url = $(cmd.target).closest('.satellite').attr('data-satelliteurl');
            //debug.print(`received command ${cmd.commandName} for ${url}`);
            var selectedSatellite = this.homeContainer.model().findSatellite(url);
            //var polestar;
            switch (cmd.command) {
                case commands.uploadPolestarCommand:
                    //polestar = true;
                    var uploader = new webframeUploader(selectedSatellite);
                    uploader.start(true).then(function () {
                        _this.refreshSatellite(selectedSatellite);
                    });
                    break;
                case commands.uploadWebframeCommand:
                    var uploader = new webframeUploader(selectedSatellite);
                    uploader.start(false).then(function () {
                        _this.refreshSatellite(selectedSatellite);
                    });
                    break;
                case commands.createSiteCommand:
                    var wh = new webframeHelper(selectedSatellite);
                    wh.create().then(function (r) {
                        if (r) {
                            _this.refreshSatellite(selectedSatellite);
                        }
                    });
                    break;
                case commands.upgradeSiteCommand:
                case commands.deleteSiteCommand:
                    var siteName = $(cmd.target).closest('.site').attr('data-site');
                    var sm = selectedSatellite.findSite(siteName);
                    var wh = new webframeHelper(selectedSatellite);
                    if (cmd.command === commands.deleteSiteCommand) {
                        wh.delete(sm).then(function (r) {
                            if (r) {
                                _this.refreshSatellite(selectedSatellite);
                            }
                        });
                    }
                    else {
                        wh.upgrade(sm).then(function (r) {
                            if (r) {
                                _this.refreshSatellite(selectedSatellite);
                            }
                        });
                    }
                    break;
                case commands.backupSiteCommand:
                    var siteName = $(cmd.target).closest('.site').attr('data-site');
                    var sm = selectedSatellite.findSite(siteName);
                    var wh = new webframeHelper(selectedSatellite);
                    wh.backup(sm).then(function () { });
                    break;
                default:
                    fastnet.debug.print("command " + cmd.commandName + " for satellite " + selectedSatellite.url + " not implemented");
                    break;
            }
        };
        app.prototype.refreshSatellite = function (s) {
            var _this = this;
            return this.getSatelliteInformation(s).then(function () {
                _this.attachSatelliteListCommands();
            });
        };
        app.prototype.getSatelliteInformation = function (s) {
            var _this = this;
            var url = s.url + "/";
            if (s.version === 0.0) {
                url += "cmd/locationinfo";
            }
            else {
                url += "cmd/satellite/current";
            }
            return fastnet.ajax.Get({ url: url, cache: false }, true).then(function (result) {
                if (s.version === 0.0) {
                    var data00 = result.data;
                    s.machine("unknown");
                    s.webframeIsUploaded(data00.deploymentIsAvailable);
                    s.uploadedWebframeVersion(new versionModel(data00.version));
                    s.isReady(true);
                }
                else {
                    var data = result.data;
                    var rs = new satelliteModel(data, _this.homeContainer.model().webframeSourceSatellite());
                    rs.isReady(true);
                    _this.homeContainer.model().satellites.replace(s, rs);
                }
                return result;
            }, function (err) {
                if (err.trim() === "") {
                    err = "No failure reason available";
                }
                s.failureReason(url + " failed: " + err);
                s.hasAccessFailed(true);
                s.isReady(true);
            });
        };
        return app;
    }());
    fastnet.app = app;
    var webframeActions = (function () {
        function webframeActions() {
            //protected remoteMessageHub: messageHub = null;
            this.logHandler = 0;
            this.satellite = null;
        }
        return webframeActions;
    }());
    var webframeHelper = (function (_super) {
        __extends(webframeHelper, _super);
        //private homeMessageHub: messageHub = null;
        function webframeHelper(/*messageHub: messageHub,*/ satellite) {
            _super.call(this);
            //this.homeMessageHub = messageHub;
            this.satellite = satellite;
        }
        webframeHelper.prototype.create = function () {
            var _this = this;
            var nsm = new newSiteModel(this.satellite);
            return new Promise(function (resolve, reject) {
                var caption = "New Webframe site on " + _this.satellite.url;
                // THIS WILL NOT WORK WITH LATEST FORM.TS
                var csf = new fastnet.form({
                    onCommand: function (cmd) {
                        switch (cmd.command) {
                            case commands.cancelcommand:
                                resolve(false);
                                break;
                            case commands.okcommand:
                                _this.createStep2(nsm).then(function () {
                                    fastnet.debug.print("new site created");
                                    resolve(true);
                                });
                                break;
                        }
                    },
                    caption: caption,
                    templateName: "createWebframeSite",
                    afterDisplay: function () {
                        //command.disable(commands.okcommand);
                        csf.bindModel(nsm);
                    }
                });
                csf.show();
            });
        };
        webframeHelper.prototype.delete = function (site) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var mb = new fastnet.messageBox({
                    caption: _this.satellite.url + ": Confirm",
                    template: "<div>Are you sure you want to delete site " + site.name + "?</div>",
                    classNames: "confirm-box",
                    okButtonCaption: "Yes",
                    cancelButtonCaption: "No"
                });
                mb.show().then(function (r) {
                    if (r) {
                        fastnet.debug.print("delete confirmed");
                        _this.deleteStep2(site).then(function () {
                            //this.closeRemoteLog();
                            resolve(true);
                        });
                    }
                    else {
                        fastnet.debug.print("delete cancelled");
                        resolve(false);
                    }
                });
            });
        };
        webframeHelper.prototype.upgrade = function (site) {
            var _this = this;
            var bi = new fastnet.busyIndicator();
            bi.block("Upgrading site " + site.name + " on " + this.satellite.url);
            return new Promise(function (resolve) {
                var url = _this.satellite.url + ("/cmd/upgrade/site/" + site.name);
                return fastnet.ajax.Get({ url: url, cache: false }, true).then(function (r) {
                    //this.closeRemoteLog();
                    resolve(true);
                    bi.unBlock();
                });
                //return this.logRemoteMessages().then(() => {
                //});
            });
        };
        webframeHelper.prototype.backup = function (site) {
            var _this = this;
            var bi = new fastnet.busyIndicator();
            bi.block("Backup of site " + site.name + " on " + this.satellite.url);
            return new Promise(function (resolve) {
                var url = _this.satellite.url + ("/cmd/backup/site/" + site.name);
                return fastnet.ajax.Get({ url: url, cache: false }, true).then(function (r) {
                    //this.closeRemoteLog();
                    resolve();
                    bi.unBlock();
                });
                //return this.logRemoteMessages().then(() => {
                //});
            });
        };
        webframeHelper.prototype.deleteStep2 = function (site) {
            var bi = new fastnet.busyIndicator();
            bi.block("Deleting site " + site.name + " on " + this.satellite.url);
            var url = this.satellite.url + ("/cmd/delete/site/" + site.name);
            return fastnet.ajax.Get({ url: url }, true).then(function (r) {
                //this.closeRemoteLog();
                bi.unBlock();
            });
            //return this.logRemoteMessages().then((resolve) => {
            //});
        };
        webframeHelper.prototype.createStep2 = function (nsm) {
            var newSite = {
                name: nsm.name(),
                url: nsm.url(),
                fromAddress: nsm.fromAddress(),
                customisation: nsm.customisation(),
                legacyDatabase: nsm.legacyDatabase()
            };
            var bi = new fastnet.busyIndicator();
            bi.block("Creating site " + nsm.name() + " on " + this.satellite.url);
            var url = this.satellite.url + "/cmd/create/site";
            return fastnet.ajax.Post({ url: url, data: newSite }, true).then(function () {
                //this.closeRemoteLog();
                bi.unBlock();
            });
            //return this.logRemoteMessages().then(() => {
            //});
        };
        return webframeHelper;
    }(webframeActions));
    var webframeUploader = (function (_super) {
        __extends(webframeUploader, _super);
        function webframeUploader(/*messageHub: messageHub,*/ uploadTo) {
            _super.call(this);
            this.messages = [
                { type: "zipprogress", handlerNumber: null },
                { type: "zipFinished", handlerNumber: null },
                { type: "transferInfo", handlerNumber: null },
                { type: "unzipFinished", handlerNumber: null },
                { type: "uploadFinished", handlerNumber: null }
            ];
            this.mb = null;
            //private messageHub: messageHub = null;
            //private satellite: satelliteModel = null;
            this.promiseResolver = null;
            //this.messageHub = messageHub;
            this.satellite = uploadTo;
        }
        webframeUploader.prototype.start = function (uploadPolestar) {
            var _this = this;
            var polestar = uploadPolestar; // == undefined || uploadPolestar == null ? false : true;
            return new Promise(function (resolve, reject) {
                _this.promiseResolver = resolve;
                //this.addMessageHandlers();
                var messageBody = _this.getProgressFormTemplate();
                var temp = $(messageBody);
                temp.find('.subject').text("Upload to: " + _this.satellite.url);
                var caption = polestar ? "Polestar Upload" : "Webframe Upload";
                _this.mb = new fastnet.messageBox({
                    caption: caption, template: temp.get(0).outerHTML,
                    classNames: "upload", okButtonDisable: true, cancelButtonDisable: true,
                    afterDisplay: function () {
                        if (!polestar) {
                            $('.progress-form').find('.stage').text("Compressing webframe files ...");
                        }
                    }
                });
                _this.mb.show().then(function (r) { });
                var cmd = polestar ? "polestardeployment" : "webframedeployment";
                var url = "cmd/" + cmd + "/start?url=" + encodeURI(_this.satellite.url);
                return fastnet.ajax.Get({ url: url, cache: false }).then(function (r) {
                    var uploadInfo = r.data;
                    $('.progress-form').find('.stage').text("Uploading in " + uploadInfo.totalChunks + " blocks");
                    _this.uploadBlock(uploadInfo);
                });
            });
            //return this.logRemoteMessages().then(() => {
            //});
        };
        webframeUploader.prototype.uploadBlock = function (uploadInfo) {
            var _this = this;
            if (uploadInfo.chunkNumber < uploadInfo.totalChunks) {
                //debug.print(`File: ${uploadInfo.filename}, uploaded chunk ${uploadInfo.chunkNumber} ...`);
                var url = "cmd/upload/" + uploadInfo.key + "/" + uploadInfo.chunkNumber + "/" + uploadInfo.chunkSize + "?url=" + encodeURI(uploadInfo.satellite.url) + "&file=" + encodeURI(uploadInfo.filename);
                fastnet.ajax.Get({ url: url, cache: false }).then(function (r) {
                    //debug.print(`    ...File: ${uploadInfo.filename}, uploaded chunk ${uploadInfo.chunkNumber}`);
                    uploadInfo.chunkNumber++;
                    $('.progress-form').find('.progress').text("transferred " + uploadInfo.chunkNumber + "/" + uploadInfo.totalChunks);
                    _this.uploadBlock(uploadInfo);
                });
            }
            else {
                if (!uploadInfo.isPolestarUpload) {
                    $('.progress-form').find('.progress').text("");
                    $('.progress-form').find('.stage').text("Expanding webframe files ...");
                }
                var url = "cmd/finaliseupload/" + uploadInfo.isPolestarUpload + "/" + uploadInfo.key + "?url=" + encodeURI(uploadInfo.satellite.url);
                fastnet.ajax.Get({ url: url, cache: false }).then(function (r) {
                    //debug.print(`File: ${uploadInfo.filename}, uploaded finished`);
                    _this.mb.close();
                    //this.removeMessageHandlers();
                    _this.promiseResolver();
                });
            }
        };
        webframeUploader.prototype.handleMessages = function (m) {
            switch (m.messageType.toLowerCase()) {
                case "zipprogress":
                    var zp = m;
                    var progress = zp.completed + "/" + zp.grossTotal;
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
                    var zf = m;
                    $('.progress-form').find('.stage').text("Zip finished");
                    $('.progress-form').find('.progress').text("");
                    break;
                case "unzipfinished":
                    var zf = m;
                    $('.progress-form').find('.stage').text("unZip finished");
                    $('.progress-form').find('.progress').text("");
                    break;
            }
        };
        ;
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
        webframeUploader.prototype.getProgressFormTemplate = function () {
            var template = "<div class='progress-form'>\n                    <div>\n                        <span class='subject'></span>\n                    </div>\n                    <div>\n                        <div class='stage'></div>\n                        <div class='progress'></div>\n                    </div>\n                </div>";
            return template;
        };
        return webframeUploader;
    }(webframeActions));
    var newSiteModel = (function () {
        function newSiteModel(satellite) {
            var _this = this;
            try {
                var existingNames = [];
                $.each(satellite.sites(), function (index, item) {
                    if (item.isWebframe) {
                        existingNames.push(item.name);
                    }
                });
                this.urlRequired = satellite.type === 0 /* Live */ || satellite.type === 1 /* Test */;
                this.name = ko.observable();
                this.url = ko.observable();
                this.fromAddress = ko.observable();
                this.customisation = ko.observable();
                this.customisationHelp = ko.observable();
                this.legacyDatabase = ko.observable();
                this.name.extend({ required: { message: "Provide a name for the site" } })
                    .extend({ pattern: { params: /^[a-z0-9]+$/i, message: "Site names cannot have spaces or punctuation characters" } })
                    .extend({
                    exclusionList: {
                        params: existingNames,
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
                    if (satellite.type === 1 /* Test */) {
                        this.url.extend({
                            validation: {
                                validator: function (val) {
                                    return val.endsWith("test.webframe.co.uk") || val.endsWith("demo.webframe.co.uk");
                                },
                                message: 'Url must end with either test.webframe.co.uk or demo.webframe.co.uk'
                            }
                        });
                    }
                }
                this.fromAddress.extend({ required: { message: "Provide an email to use as a \"from\" address" } })
                    .extend({ email: true });
                this.customisation.subscribe(function (nv) {
                    if (nv.trim().length === 0) {
                        _this.customisationHelp("");
                    }
                    else {
                        _this.customisationHelp("Customisation file will be customisation." + nv + ".json");
                    }
                });
            }
            catch (xe) {
                debugger;
            }
        }
        return newSiteModel;
    }());
    var siteModel = (function () {
        function siteModel(site) {
            this.name = site.name;
            this.host = site.name;
            this.port = site.port;
            this.poolName = site.poolName;
            this.databaseNames = site.databaseNames;
            this.isWebframe = site.isWebframe;
            this.isPaused = site.isPaused;
            this.isUpgradeable = site.isUpgradeable;
            this.version = ko.observable(new versionModel(site.version));
        }
        return siteModel;
    }());
    var versionModel = (function () {
        function versionModel(v) {
            if (v !== null) {
                this.major = ko.observable(v.major);
                this.minor = ko.observable(v.minor);
                this.build = ko.observable(v.build);
                this.revision = ko.observable(v.revision);
            }
            else {
                this.major = ko.observable(0);
                this.minor = ko.observable(0);
                this.build = ko.observable(0);
                this.revision = ko.observable(0);
            }
        }
        versionModel.prototype.toString = function () {
            return this.major() + "." + this.minor() + "." + this.build() + "." + this.revision();
        };
        versionModel.prototype.compare = function (r) {
            //var r = new versionModel(another);
            var l = this;
            if (l.major() > r.major()) {
                return 1;
            }
            else if (l.major() < r.major()) {
                return -1;
            }
            else {
                if (l.minor() > r.minor()) {
                    return 1;
                }
                else if (l.minor() < r.minor()) {
                    return -1;
                }
                else {
                    if (l.build() > r.build()) {
                        return 1;
                    }
                    else if (l.build() < r.build()) {
                        return -1;
                    }
                    else {
                        if (l.revision() > r.revision()) {
                            return 1;
                        }
                        else if (l.revision() < r.revision()) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                }
            }
        };
        return versionModel;
    }());
    var satelliteModel = (function () {
        // sourceSatellite == null when this is the sourceSatellite
        function satelliteModel(s, sourceSatellite) {
            var _this = this;
            this.active = null;
            this.assemblyVersion = null;
            this.name = null;
            this.url = null;
            this.version = null;
            this.name = s.name;
            this.assemblyVersion = s.assemblyVersion === undefined || s.assemblyVersion === null ? "0.0.0" : s.assemblyVersion;
            this.url = s.url;
            this.active = s.active;
            this.version = s.version;
            this.type = s.type;
            this.isWebframeSource = s.isWebframeSource;
            this.publishedWebframeVersion = ko.observable(new versionModel(s.latestAvailableWebframeVersion));
            this.publishingFolder = s.publishingFolder;
            this.distributionFolder = s.distributionFolder;
            this.siteRootFolder = s.siteRootFolder;
            this.upgradeRootFolder = s.upgradeRootFolder;
            this.webframeMarkerDll = s.webframeMarkerDll;
            this.webframeRootDrive = s.webframeRootDrive;
            this.machine = ko.observable((s.machine === null || s.machine.trim() === "") ? "<unknown machine>" : s.machine);
            this.webframeIsUploaded = ko.observable(s.webframeIsUploaded);
            this.uploadedWebframeVersion = ko.observable();
            this.isReady = ko.observable(false);
            this.hasAccessFailed = ko.observable(false);
            this.failureReason = ko.observable("");
            this.newVersionWaitingUpload = ko.observable(false);
            if (s.uploadedWebframeVersion === null) {
                this.uploadedWebframeVersion(new versionModel({ major: 0, minor: 0, revision: 0, build: 0 }));
            }
            else {
                this.uploadedWebframeVersion(new versionModel(s.uploadedWebframeVersion));
            }
            this.sites = ko.observableArray();
            //`${this.major()}.${this.minor()}.${this.revision()}.${this.build()}`;
            $.each(s.sites, function (index, s) {
                var sm = new siteModel(s);
                if (s.isWebframe) {
                    fastnet.debug.print(_this.name + " publishedWebframeVersion = " + _this.publishedWebframeVersion() + " uploadedWebframeVersion = " + _this.uploadedWebframeVersion() + " :::: " + s.name + " ::: s values: isUpgradeable = " + s.isUpgradeable + ", version =  " + s.version.major + "." + s.version.minor + "." + s.version.build + "." + s.version.revision + " :: sm values: isUpgradeable = " + sm.isUpgradeable + ", version = " + sm.version());
                }
                _this.sites.push(sm);
            });
            if (this.isWebframeSource === false && this.uploadedWebframeVersion().compare(sourceSatellite.publishedWebframeVersion()) < 0) {
                this.newVersionWaitingUpload(true);
            }
        }
        satelliteModel.prototype.findSite = function (name) {
            var site = null;
            ko.utils.arrayForEach(this.sites(), function (item, index) {
                if (item.name === name) {
                    site = item;
                    return false;
                }
            });
            return site;
        };
        return satelliteModel;
    }());
    var homePageModel = (function () {
        function homePageModel(satelliteList) {
            var _this = this;
            this.webframeSourceSatellite = null;
            var wfSource = satelliteList.find(function (s1) { return s1.isWebframeSource; });
            if (wfSource !== null) {
                this.webframeSourceSatellite = ko.observable(new satelliteModel(wfSource, null));
            }
            this.satellites = ko.observableArray();
            $.each(satelliteList, function (index, s) {
                var sm = new satelliteModel(s, _this.webframeSourceSatellite());
                if (!s.isWebframeSource) {
                    _this.satellites.push(sm);
                }
            });
        }
        homePageModel.prototype.findSatellite = function (url) {
            var satellite = null;
            ko.utils.arrayForEach(this.satellites(), function (item, index) {
                if (item.url === url) {
                    satellite = item;
                    return false;
                }
            });
            return satellite;
        };
        return homePageModel;
    }());
})(fastnet || (fastnet = {}));
//# sourceMappingURL=home.js.map