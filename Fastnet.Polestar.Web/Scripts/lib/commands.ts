/// <reference path="../package.d.ts" />
namespace fastnet {
    /**
     * Checks if the given argument is a receivedCommand
     */
    export function isReceivedCommand(object: any): object is receivedCommand {
        return object.page !== undefined
            && object.command !== undefined
            && object.target !== undefined && object.target instanceof Element;
    }
    // add to this list as required - enums are automatically combined as long as 
    // the numbers do not clash
    // value 0 is reserved
    // values 1 - 9999 available to apps
    // values 10000 and higher - reserved to system
    /**
     * Commands enum: each unique command has to have an enum
     * Add more as required in the range 1 - 9999
     * All others are reserved
     */
    export enum commands { // starts at 10000
        unknown = 0,
    }
    /**
     * Object returned to a command listener contains details of the command that
     * received the click event;
     */
    export class receivedCommand {
        page: string;
        /**
         * Element that was clicked
         */
        target: Element; // this is what was clicked
        /**
         * Element that has the command attribute (normally data-command).
         * May not be the same as target.
         */
        commandElement: Element; // this is where the commandAttr (data-comand) is, commandElement may be the same as target
        /**
         * the command itself, one of the commands enum
         */
        command: commands;
        /**
         * The command attribute  (normally data-command) value.
         */
        commandName: string;
        /**
         * True if the command was a knockout registered component see elementtag, elementViewModel, etc.
         */
        isComponent: boolean;
        /**
         * The view model (data object) if  isComponent is true.
         */
        viewModel: any;
        public disable(): void {
            command.disable(this.command);
        }
        public enable(): void {
            command.enable(this.command);
        }
    }
    export interface commandListener {
        (dc: receivedCommand): void;
    }
    export class command {
        private static commandAttr: string = "data-command";
        private static pageAttr: string = "data-page";
        private static eventName: string = "click.commands";
        public static detach(root: JQuery | Element | string) {
            toJQuery(root).off();
        }
        public static attach(root: JQuery | Element | string, listener: commandListener) {
            toJQuery(root)
                .find(`[${command.commandAttr}]`).addBack(`[${command.commandAttr}]`)
                .each((index, item) => {
                    $(item).off(command.eventName).on(command.eventName, (e) => {
                        var page = "";
                        var pageElem = $(e.target).closest(`[${command.pageAttr}]`);
                        if (pageElem.length > 0) {
                            page = $(pageElem).attr(command.pageAttr);
                        }
                        var cmdName = $(e.target).closest(`[${command.commandAttr}]`).attr(command.commandAttr);
                        var cmd: commands = commands[cmdName];
                        if (cmd === undefined) {
                            cmd = commands.unknown;
                            debug.print(`found unknown command: page = ${page}, commandName = ${cmdName}`);
                        }
                        var commandElement = $(e.target).closest(`[${command.commandAttr}]`).get(0);
                        var vm: elementViewModel = null;
                        if (ko.components.isRegistered(commandElement.tagName.toLowerCase())) {
                            vm = ko.dataFor(e.target);
                            if (vm.handleEvent) {
                                vm.handleEvent(command.eventName);
                            }
                            //debug.print(`${command.eventName} for ko component ${commandElement.tagName}`);
                        }
                        if (listener !== null) {
                            e.stopPropagation();
                            e.preventDefault();
                            var dcl = new receivedCommand();
                            dcl.page = page;
                            dcl.command = cmd;
                            dcl.target = e.target;
                            dcl.commandElement = commandElement;
                            dcl.viewModel = vm;
                            dcl.isComponent = vm !== null;
                            dcl.commandName = cmdName;
                            listener(dcl);
                        }
                    });
                });
        }
        public static enable(cmd: commands, selector: string = null): void {
            let selctor = `[${command.commandAttr}='${commands[cmd]}']`;// " [data-command]";
            if (selector !== null) {
                selctor = selector + " " + selctor;
            }
            $(selctor).prop('disabled', false);
        }
        public static disable(cmd: commands, selector: string = null): void {
            let selctor = `[${command.commandAttr}='${commands[cmd]}']`;// " [data-command]";
            if (selector !== null) {
                selctor = selector + " " + selctor;
            }
            $(selctor).prop('disabled', true);
        }
        public static setCheckboxTool(tool: JQuery | Element | string, checked: boolean) {
            var elem = toJQuery(tool);
            if (checked) {
                elem.addClass("checked");
            } else {
                elem.removeClass("checked");
            }
        }
    }
}