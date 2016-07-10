// namespace SignalR {
//     interface ConnectionOptions {
//         withCredentials?: boolean
//     }
// }
// export namespace SignalR {
//     export interface ConnectionOptions {
//         withCredentials?: boolean
//     }
// }
var fastnet;
(function (fastnet) {
    var logLevel;
    (function (logLevel) {
        logLevel[logLevel["debug"] = 1] = "debug";
        logLevel[logLevel["verbose"] = 2] = "verbose";
        logLevel[logLevel["information"] = 3] = "information";
        logLevel[logLevel["warning"] = 4] = "warning";
        logLevel[logLevel["error"] = 5] = "error";
        logLevel[logLevel["critical"] = 6] = "critical";
        logLevel[logLevel["none"] = 65536] = "none";
    })(logLevel || (logLevel = {}));
    var messageHub = (function () {
        function messageHub() {
            this.connection = null;
            this.url = "/";
            this.registry = [];
            this.handlerNumber = 0;
            this._printLogs = false;
        }
        Object.defineProperty(messageHub.prototype, "PrintLogs", {
            get: function () {
                return this._printLogs;
            },
            set: function (val) {
                this._printLogs = val;
            },
            enumerable: true,
            configurable: true
        });
        messageHub.prototype.stop = function () {
            var _this = this;
            $.each(this.registry, function (index1, register) {
                $.each(register.handlerList, function (index2, hf) {
                    _this.removeHandler(register.messageType, hf.id);
                });
            });
            this.connection.stop();
        };
        messageHub.prototype.start = function (siteUrl) {
            var _this = this;
            var onMessageReceived = function (m) {
                m.source = _this.url;
                var mt = m.messageType.toLowerCase();
                if (mt === "logmessage") {
                    if (_this.PrintLogs) {
                        var lm = m;
                        var level = logLevel[lm.level]; // lm.level[lm.level];
                        fastnet.debug.print(lm.source + " " + fastnet.date.toDateTimeSecString(lm.dateTimeUtc) + " " + level.substring(0, 4).toUpperCase() + " [" + lm.name + "]: " + lm.text);
                    }
                }
                else {
                    var mr = _this.registry[mt];
                    if (mr !== undefined) {
                        $.each(mr.handlerList, function (index, item) {
                            item.func(m);
                        });
                    }
                }
            };
            return new Promise(function (resolve, reject) {
                try {
                    //$.connection.hub.logging = true;
                    if (siteUrl !== undefined) {
                        _this.url = siteUrl;
                        var remoteHub = $.hubConnection(siteUrl + "/signalr");
                        var remoteHubProxy = remoteHub.createHubProxy('messageHub');
                        remoteHubProxy.on("messageReceived", function (m) {
                            onMessageReceived(m);
                        });
                        _this.connection = remoteHub;
                    }
                    else {
                        var hub = $.connection.messageHub;
                        _this.connection = $.connection.hub;
                        hub.client.messageReceived = function (m) {
                            onMessageReceived(m);
                        };
                    }
                    _this.connection.start({ withCredentials: false }).then(function () {
                        fastnet.debug.print(_this.url + " message hub connected");
                        resolve();
                    });
                }
                catch (xe) {
                    reject(xe);
                }
            });
        };
        messageHub.prototype.addHandler = function (messageType, handler) {
            messageType = messageType.toLowerCase();
            var mr = this.registry[messageType];
            if (mr === undefined) {
                mr = { messageType: messageType, handlerList: [] };
                this.registry[messageType] = mr;
            }
            var fn = ++this.handlerNumber;
            mr.handlerList.push({ func: handler, id: fn });
            return fn;
        };
        messageHub.prototype.removeHandler = function (messageType, handlerNumber) {
            messageType = messageType.toLowerCase();
            var mr = this.registry[messageType];
            if (mr !== undefined) {
                var result = -1;
                $.each(mr.handlerList, function (index, item) {
                    if (item.id === handlerNumber) {
                        result = index;
                        return false;
                    }
                });
                if (result >= 0) {
                    mr.handlerList.splice(result, 1);
                }
            }
        };
        return messageHub;
    }());
    fastnet.messageHub = messageHub;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=messagehub.js.map