var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var fastnet;
(function (fastnet) {
    (function (commands) {
        commands[commands["cancelcommand"] = 10100] = "cancelcommand";
        commands[commands["okcommand"] = 10101] = "okcommand";
    })(fastnet.commands || (fastnet.commands = {}));
    var commands = fastnet.commands;
    var baseForm = (function () {
        function baseForm(options) {
            this.options = null;
            this.commandHandler = null;
            var defaultOptions = {
                modal: true,
                caption: "(no caption)",
                classNames: null,
                onCommand: null,
                templateName: null,
                template: null,
                okButtonDisable: false,
                okButtonCaption: "OK",
                cancelButtonDisable: false,
                cancelButtonCaption: "Cancel",
                afterDisplay: null
            };
            this.options = $.extend({}, defaultOptions, options);
            var instance = baseForm.list.size();
            this.id = "fastnet-form-" + instance;
            baseForm.list.setValue(this.id, this);
        }
        Object.defineProperty(baseForm.prototype, "Id", {
            get: function () {
                return this.id;
            },
            enumerable: true,
            configurable: true
        });
        baseForm.prototype.display = function (onCommand) {
            var _this = this;
            var finaliseDisplay = function () {
                // **NB** the following code adding classnames was originally in 
                // openModal but it was losing the value of this when inside that method
                // in the case where the template was fetched asynchronously
                // I was never able to solve that so I've moved it here
                // if (this.options.classNames !== undefined && this.options.classNames.length > 0) {
                //     $(`#${this.id}`).addClass(this.options.classNames);
                // }
                if (fastnet.f$.isUndefinedOrNull(_this.options.classNames) === false && _this.options.classNames.length > 0) {
                    $("#" + _this.id).addClass(_this.options.classNames);
                }
                if (_this.options.afterDisplay !== null) {
                    _this.options.afterDisplay();
                }
                //var cp = new command();
                fastnet.command.attach("#" + _this.id, function (cmd) {
                    _this.onCommand(cmd);
                });
            };
            this.commandHandler = onCommand;
            if (this.options.modal) {
                this.openModal().then(function () {
                    fastnet.debug.print(_this.id);
                    finaliseDisplay();
                });
            }
            else {
                fastnet.debug.print("modeless form not implemented");
            }
        };
        /**
         * Detach all commands (i.e. data-command elements)
         * Remove the form from the DOM
         * Remove the forms container from the DOM if this is the last form
         */
        baseForm.prototype.close = function () {
            fastnet.command.detach("#" + this.id);
            baseForm.list.remove(this.id);
            $("#" + this.id).remove();
            if (baseForm.list.size() === 0) {
                $("body > #forms-container").hide();
            }
        };
        baseForm.prototype.getTemplate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                resolve("<div class='form-modal' id='" + _this.id + "'></div>");
            });
        };
        baseForm.prototype.ensureContainer = function () {
            var container = $("body > #forms-container");
            if (container.length === 0) {
                var template = "<div id='forms-container'></div>";
                $("body").append($(template));
                container = $("body > #forms-container");
            }
            container.show();
        };
        // protected modifyTemplate(template: string): string {
        //     return template;
        // }
        baseForm.prototype.openModal = function () {
            var _this = this;
            this.ensureContainer();
            return this.getTemplate().then(function (template) {
                // var modaltemplate = this.modifyTemplate(template);
                $("#forms-container").append($(template));
                // if (this.options.classNames !== undefined && this.options.classNames.length > 0) {
                //     $(`#${this.id}`).addClass(this.options.classNames);
                // }
                var element = $("#" + _this.id).get(0);
                _this.interactable = interact(element);
                _this.interactable.draggable({
                    inertia: true,
                    restrict: {
                        restriction: 'parent',
                        //endOnly: true,
                        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                    },
                    autoScroll: true,
                    onmove: _this.dragMoveListener
                }).resizable({
                    edges: { left: true, right: true, bottom: true, top: true }
                }).on('resizemove', function (event) {
                    var target = event.target, x = (parseFloat(target.getAttribute('data-x')) || 0), y = (parseFloat(target.getAttribute('data-y')) || 0);
                    // update the element's style
                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';
                    // translate when resizing from top or left edges
                    x += event.deltaRect.left;
                    y += event.deltaRect.top;
                    target.style.webkitTransform = target.style.transform =
                        'translate(' + x + 'px,' + y + 'px)';
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                    //target.textContent = event.rect.width + '×' + event.rect.height;
                });
            });
        };
        baseForm.prototype.onCommand = function (cmd) {
            if (this.commandHandler !== null) {
                this.commandHandler(cmd);
            }
        };
        baseForm.prototype.dragMoveListener = function (event) {
            var target = event.target, 
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx, y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            // translate the element
            target.style.webkitTransform =
                target.style.transform =
                    'translate(' + x + 'px, ' + y + 'px)';
            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        };
        baseForm.list = new collections.Dictionary();
        return baseForm;
    }());
    fastnet.baseForm = baseForm;
    // export class validatableModel {
    //     //public modelGroup: KnockoutValidationGroup = null;
    //     public isValid(): boolean {
    //         return this.modelGroup === null ? true : this.modelGroup.isValid();
    //     }
    // }
    /**
     * An interactive form without using browser windows
     * NB: needs forms.css
     */
    var form = (function (_super) {
        __extends(form, _super);
        function form(options) {
            _super.call(this, options);
            //private model: validatableModel = null;
            this.modelGroup = null;
            this.result = null;
            this.promise = null;
        }
        form.prototype.getTemplate = function () {
            var _this = this;
            var template = "<div class='form-modal' id='" + this.id + "'></div>";
            if (this.options.templateName !== null) {
                return fastnet.template.fetch(this.options.templateName).then(function (htmlFragment) {
                    return _this.buildForm(template, htmlFragment);
                });
            }
            else {
                return new Promise(function (resolve, reject) {
                    if (_this.options.template !== null) {
                        // use the provided template and combine it
                        resolve(_this.buildForm(template, _this.options.template));
                    }
                    else {
                        resolve(template);
                    }
                });
            }
            ;
        };
        /**
         * Show the form - promise returns when the form is closed
         * Both okcommand and cancelcommand automatically close the form
         * okcommand will be ignored if the form model is not valid
         * Promise parameter is true if okcommand, false if cancelcommand, or else null
         */
        form.prototype.show = function () {
            var _this = this;
            this.promise = new Promise(function (resolve, reject) {
                _this.resolver = resolve;
                _super.prototype.display.call(_this, function (cmd) {
                    var shouldClose = false;
                    switch (cmd.command) {
                        case commands.okcommand:
                            var canClose = true;
                            if (_this.modelGroup.isValid() === false) {
                                _this.modelGroup.errors.showAllMessages();
                                canClose = false;
                            }
                            if (canClose) {
                                _this.result = true;
                                shouldClose = true;
                            }
                            break;
                        case commands.cancelcommand:
                            _this.result = false;
                            shouldClose = true;
                            //this.close();
                            break;
                    }
                    if (cmd.command !== commands.okcommand || shouldClose === true) {
                        if (_this.options.onCommand === null) {
                            fastnet.debug.print("form " + _this.id + ": command " + cmd.commandName + ", no onCommand handler provided");
                        }
                        else {
                            _this.options.onCommand(cmd);
                        }
                    }
                    if (shouldClose) {
                        _this.close();
                    }
                });
            });
            return this.promise;
        };
        form.prototype.close = function () {
            fastnet.koHelper.unBind("#forms-container #" + this.Id);
            _super.prototype.close.call(this);
            this.resolver(this.result);
        };
        /**
         * Bind a datamodel to the form
         * Validation rules can, and should, be specified for model properties
         * The entire model will also be validated (unless validateWholeModel is set false)
         */
        form.prototype.bindModel = function (model, validateWholeModel) {
            if (validateWholeModel === void 0) { validateWholeModel = true; }
            //this.model = model;
            if (validateWholeModel) {
                this.modelGroup = ko.validatedObservable(model);
            }
            fastnet.koHelper.bind(model, "#forms-container #" + this.Id);
        };
        /**
         * return true if all the model properties are valid, or if validation has been turned off.
         */
        form.prototype.isValid = function () {
            return this.modelGroup === null ? true : this.modelGroup.isValid();
        };
        /**
         * returns an string array of current error messages
         * empty if there are no errors
         */
        form.prototype.getErrors = function () {
            if (this.modelGroup === null ? true : this.modelGroup.isValid()) {
                return [];
            }
            else {
                return this.modelGroup.errors();
            }
        };
        form.prototype.buildForm = function (baseTemplate, templateBody) {
            var title = null;
            var r = /<[a-z][\s\S]*>/;
            if (r.test(this.options.caption)) {
                title = $(this.options.caption);
            }
            else {
                title = $("<span></span>").text(this.options.caption);
            }
            var temp = $(baseTemplate).addClass("form")
                .append($("<div class='caption-bar'></div>"))
                .append($("<div class='form-body'></div>"))
                .append($("<div class='command-bar'><span data-command='okcommand' class='btn btn-confirm btn-small'>" + this.options.okButtonCaption + "</span><span data-command='cancelcommand' class='btn btn-cancel btn-small'>" + this.options.cancelButtonCaption + "</span></div>"));
            temp.find(".caption-bar").append(title);
            temp.find(".form-body").append($(templateBody));
            if (this.options.cancelButtonDisable) {
                temp.find("span[data-command='cancelcommand']").hide();
            }
            else if (this.options.cancelButtonCaption !== null) {
                temp.find("span[data-command='cancelcommand']").text(this.options.cancelButtonCaption);
            }
            if (this.options.okButtonDisable) {
                temp.find("span[data-command='okcommand']").hide();
            }
            else if (this.options.okButtonCaption !== null) {
                temp.find("span[data-command='okcommand']").text(this.options.okButtonCaption);
            }
            if (this.options.cancelButtonDisable && this.options.okButtonDisable) {
                temp.find(".command-bar").hide();
            }
            return temp.get(0).outerHTML;
        };
        return form;
    }(baseForm));
    fastnet.form = form;
    /**
     * Sets options for a messagebox
     * If both buttons are disabled, the message box must be closed in code
     */
    var messageBox = (function (_super) {
        __extends(messageBox, _super);
        //private caption: string = null;
        //private body: string = null;
        //private result: boolean = null;
        // private mbPromise: Promise<boolean> = null;
        // private mbResolver: (value?: boolean | Thenable<boolean>) => void;
        //private mbOptions: messageBoxOptions = null;
        //private closeHandler: (r: boolean) => void = null;
        /**
         * Creates a modal messagebox
         * @param caption the text to use in the caption bar
         * @param body the html for the body of the message box
         * @param options an optional instance of messageBoxOptions - controls appearance of messagebox buttons
         */
        function messageBox(options) {
            if (options === void 0) { options = { caption: "Message", template: "<span>no message body<span>" }; }
            _super.call(this, options);
            if (options.caption === undefined || options.caption === null) {
                options.caption = "Message";
            }
            if (options.template === undefined || options.template === null) {
                options.template = "<span>no message body<span>";
            }
            // this.caption = caption;
            // this.body = body;
            // this.mbOptions = $.extend({}, { modal: true }, options);
            // this.mbOptions.modal = true;
            // this.options = this.mbOptions;
        }
        messageBox.prototype.getTemplate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _super.prototype.getTemplate.call(_this).then(function (template) {
                    var temp = $(template).removeClass("form").addClass("message-box");
                    temp.find(".form-body").removeClass("form-body").addClass("message-body");
                    resolve(temp.get(0).outerHTML);
                });
            });
        };
        /**
         * Show the messagebox.
         * Promise<boolean> returns on any of okcommand, cancelcommand, or close()
         * Returned value is true if okcommand, false, if cancelcommand, or null if close()
         */
        messageBox.prototype.show = function () {
            var _this = this;
            this.promise = new Promise(function (resolve, reject) {
                _this.resolver = resolve;
                _super.prototype.display.call(_this, function (cmd) {
                    //var result = false;
                    switch (cmd.command) {
                        case commands.okcommand:
                            _this.result = true;
                            break;
                    }
                    _this.close();
                    //resolve(result);
                });
            });
            return this.promise;
        };
        return messageBox;
    }(form));
    fastnet.messageBox = messageBox;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=forms.js.map