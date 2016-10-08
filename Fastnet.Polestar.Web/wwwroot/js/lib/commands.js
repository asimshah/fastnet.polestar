var fastnet;
(function (fastnet) {
    /**
     * Checks if the given argument is a receivedCommand
     */
    function isReceivedCommand(object) {
        return object.page !== undefined
            && object.command !== undefined
            && object.target !== undefined && object.target instanceof Element;
    }
    fastnet.isReceivedCommand = isReceivedCommand;
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
    (function (commands) {
        commands[commands["unknown"] = 0] = "unknown";
    })(fastnet.commands || (fastnet.commands = {}));
    var commands = fastnet.commands;
    /**
     * Object returned to a command listener contains details of the command that
     * received the click event;
     */
    var receivedCommand = (function () {
        function receivedCommand() {
        }
        receivedCommand.prototype.disable = function () {
            command.disable(this.command);
        };
        receivedCommand.prototype.enable = function () {
            command.enable(this.command);
        };
        return receivedCommand;
    }());
    fastnet.receivedCommand = receivedCommand;
    var command = (function () {
        function command() {
        }
        command.detach = function (root) {
            fastnet.toJQuery(root).off();
        };
        command.attach = function (root, listener) {
            fastnet.toJQuery(root)
                .find("[" + command.commandAttr + "]").addBack("[" + command.commandAttr + "]")
                .each(function (index, item) {
                $(item).off(command.eventName).on(command.eventName, function (e) {
                    var page = "";
                    var pageElem = $(e.target).closest("[" + command.pageAttr + "]");
                    if (pageElem.length > 0) {
                        page = $(pageElem).attr(command.pageAttr);
                    }
                    var cmdName = $(e.target).closest("[" + command.commandAttr + "]").attr(command.commandAttr);
                    var cmd = commands[cmdName];
                    if (cmd === undefined) {
                        cmd = commands.unknown;
                        fastnet.debug.print("found unknown command: page = " + page + ", commandName = " + cmdName);
                    }
                    var commandElement = $(e.target).closest("[" + command.commandAttr + "]").get(0);
                    var vm = null;
                    if (ko.components.isRegistered(commandElement.tagName.toLowerCase())) {
                        vm = ko.dataFor(e.target);
                        if (vm.handleEvent) {
                            vm.handleEvent(command.eventName);
                        }
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
        };
        command.enable = function (cmd, selector) {
            if (selector === void 0) { selector = null; }
            var selctor = "[" + command.commandAttr + "='" + commands[cmd] + "']"; // " [data-command]";
            if (selector !== null) {
                selctor = selector + " " + selctor;
            }
            $(selctor).prop('disabled', false);
        };
        command.disable = function (cmd, selector) {
            if (selector === void 0) { selector = null; }
            var selctor = "[" + command.commandAttr + "='" + commands[cmd] + "']"; // " [data-command]";
            if (selector !== null) {
                selctor = selector + " " + selctor;
            }
            $(selctor).prop('disabled', true);
        };
        command.setCheckboxTool = function (tool, checked) {
            var elem = fastnet.toJQuery(tool);
            if (checked) {
                elem.addClass("checked");
            }
            else {
                elem.removeClass("checked");
            }
        };
        command.commandAttr = "data-command";
        command.pageAttr = "data-page";
        command.eventName = "click.commands";
        return command;
    }());
    fastnet.command = command;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=commands.js.map