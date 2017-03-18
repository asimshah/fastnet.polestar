/// <reference path="../package.d.ts" />
interface SignalR {
    messageHub: IHubProxy;
}
interface IHubProxy {
    client: IMessageClient;
    server: IMessageServer;
}
interface IMessageClient {
    messageReceived(message: any);
}

interface IMessageServer {

}
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
namespace fastnet {

    interface handlerFunction {
        func: messageHandler;
        id: number;
    }
    interface register {
        messageType: string;
        handlerList: handlerFunction[];
    }
    export interface messageBase {
        dateTimeUtc: string;
        messageType: string;
        source: string
    }
    enum logLevel {
        debug = 1,
        verbose,
        information,
        warning,
        error,
        critical,
        none = 65536
    }
    interface logMessage extends messageBase {
        level: logLevel;
        name: string;
        text: string
    }
    export interface messageHandler {
        (message: messageBase): void;
    }
    export class messageHub {
        private connection: SignalR.Hub.Connection = null;
        private url: string = "/";
        private registry: register[] = [];
        private handlerNumber: number = 0;
        private _printLogs: boolean = false;
        public get PrintLogs(): boolean {
            return this._printLogs;
        }
        public set PrintLogs(val: boolean) {
            this._printLogs = val;
        }
        public stop() {
            $.each(this.registry, (index1, register) => {
                $.each(register.handlerList, (index2, hf) => {
                    this.removeHandler(register.messageType, hf.id);
                })
            });
            this.connection.stop();
        }
        public start(siteUrl?: string): Promise<void> {
            var onMessageReceived = (m: messageBase) => {
                m.source = this.url;
                var mt = m.messageType.toLowerCase();
                if (mt === "logmessage") {
                    if (this.PrintLogs) {
                        var lm: logMessage = <logMessage>m;
                        var level: string = logLevel[lm.level];// lm.level[lm.level];
                        debug.print(`${lm.source} ${date.toDateTimeSecString(lm.dateTimeUtc)} ${level.substring(0, 4).toUpperCase()} [${lm.name}]: ${lm.text}`);
                    }
                } else {
                    var mr: register = this.registry[mt];
                    if (mr !== undefined) {
                        $.each(mr.handlerList, (index, item) => {
                            item.func(m);
                        });
                    }
                }
            };
            return new Promise<void>((resolve, reject) => {
                try {
                    //$.connection.hub.logging = true;
                    if (siteUrl !== undefined) {
                        this.url = siteUrl;
                        var remoteHub = $.hubConnection(`${siteUrl}/signalr`);
                        var remoteHubProxy = remoteHub.createHubProxy('messageHub');
                        remoteHubProxy.on("messageReceived", (m) => {
                            onMessageReceived(m);
                        });
                        this.connection = remoteHub;
                    } else {
                        var hub = $.connection.messageHub;
                        this.connection = $.connection.hub;
                        hub.client.messageReceived = (m: messageBase) => {
                            onMessageReceived(m);
                        };
                    }

                    this.connection.start(<SignalR.ConnectionOptions>{ withCredentials: false }).then(() => {
                        debug.print(`${this.url} message hub connected`);
                        resolve();
                    });
                }
                catch (xe) {
                    reject(xe);
                }
            });
        }
        public addHandler(messageType: string, handler: messageHandler): number {
            messageType = messageType.toLowerCase();
            var mr: register = this.registry[messageType];
            if (mr === undefined) {
                mr = { messageType: messageType, handlerList: [] };
                this.registry[messageType] = mr;
            }
            var fn = ++this.handlerNumber;
            mr.handlerList.push({ func: handler, id: fn });
            return fn;
        }
        public removeHandler(messageType: string, handlerNumber: number) {
            messageType = messageType.toLowerCase();
            var mr: register = this.registry[messageType];
            if (mr !== undefined) {
                var result = -1;
                $.each(mr.handlerList, (index, item) => {
                    if (item.id === handlerNumber) {
                        result = index;
                        return false;
                    }
                });
                if (result >= 0) {
                    mr.handlerList.splice(result, 1);
                }
            }
        }
    }
}