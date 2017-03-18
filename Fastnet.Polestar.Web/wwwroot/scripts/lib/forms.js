var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../package.d.ts" />
var fastnet;
(function (fastnet) {
    var commands;
    (function (commands) {
        commands[commands["cancelcommand"] = 10100] = "cancelcommand";
        commands[commands["okcommand"] = 10101] = "okcommand";
    })(commands = fastnet.commands || (fastnet.commands = {}));
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
                okButtonRemove: false,
                okButtonCaption: "OK",
                cancelButtonRemove: false,
                cancelButtonCaption: "Cancel",
                sizeRatio: 0.6,
                afterDisplay: null,
                beforeClose: null
            };
            this.options = $.extend({}, defaultOptions, options);
            if (baseForm.formStack.size() === 0) {
                baseForm.attachResizeHandler();
                //let body = $("body");
                //baseForm.bodyHeight = body.height();
                //baseForm.bodyWidth = body.width();
                baseForm.bodyHeight = window.innerHeight;
                baseForm.bodyWidth = window.innerWidth;
            }
            var instance = baseForm.formStack.size();
            this.id = "fastnet-form-" + instance;
            baseForm.formStack.push({ id: this.id, f: this });
        }
        Object.defineProperty(baseForm.prototype, "Id", {
            get: function () {
                return this.id;
            },
            enumerable: true,
            configurable: true
        });
        baseForm.prototype.bindCommands = function () {
            var _this = this;
            fastnet.command.attach("#" + this.id, function (cmd) {
                _this.onCommand(cmd);
            });
        };
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
                // $(window).on('resize.forms', () => {
                //     let f = $(`#${this.id}`);
                //     let body = $("body");
                //     this.bodyHeight = body.height();
                //     this.bodyWidth = body.width();
                //     let h = f.height();
                //     let w = f.width();
                //     // let bh = $("body").height();
                //     // let bw = $("body").width();
                //     if (this.bodyHeight - h < 0 || this.bodyWidth - w < 0) {
                //         this.resize();
                //     } else {
                //         this.centre(w, h);
                //     }
                // });
                _this.resize();
                _this.bindCommands();
                // command.attach(`#${this.id}`, (cmd: receivedCommand) => {
                //     this.onCommand(cmd);
                // });
            };
            this.commandHandler = onCommand;
            if (this.options.modal) {
                this.openModal().then(function () {
                    //debug.print(this.id);
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
            var f = baseForm.formStack.pop();
            $("#" + f.id).closest(".form-root").remove();
            if (baseForm.formStack.size() === 0) {
                $("body > #forms-container").hide(); // okk
                baseForm.detachResizeHandler();
            }
            else {
                var cf = baseForm.formStack.peek();
                cf.f.resize();
            }
        };
        baseForm.prototype.getTemplate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                resolve("<div class='form-root'><div class='form-modal' id='" + _this.id + "'></div></div>");
            });
        };
        baseForm.prototype.ensureContainer = function () {
            var container = $("body > #forms-container");
            if (container.length === 0) {
                var template = "<div id='forms-container'></div>"; // okk `<div id='forms-container'><div class='form-list'></div?</div>`
                $("body").append($(template));
                container = $("body > #forms-container");
            }
            container.show();
        };
        baseForm.prototype.resize = function () {
            var r = this.options.sizeRatio;
            var h = baseForm.bodyHeight * r; // bh * r;
            var w = baseForm.bodyWidth * r; //bw * r;
            this.setSize(w, h);
        };
        baseForm.prototype.setSize = function (w, h) {
            //$(`#${this.id}`).height(h);
            //$(`#${this.id}`).width(w);
            this.centre(w, h);
        };
        baseForm.prototype.centre = function (w, h) {
            var formRoot = $("#" + this.id).parent();
            var bh = baseForm.bodyHeight;
            var bw = baseForm.bodyWidth;
            var availHeight = bh - h;
            var availWidth = bw - w;
            formRoot.css("top", availHeight / 2);
            formRoot.css("left", availWidth / 2);
        };
        baseForm.prototype.openModal = function () {
            var _this = this;
            this.ensureContainer();
            return this.getTemplate().then(function (template) {
                // var modaltemplate = this.modifyTemplate(template);
                $("#forms-container").append($(template));
                var element = $("#" + _this.id).get(0);
                _this.interactable = interact(element);
                _this.interactable
                    .resizable({
                    edges: { left: true, right: true, bottom: true, top: true }
                })
                    .on('resizemove', function (event) {
                    var target = event.target;
                    var dx = event.dx;
                    var dy = event.dy;
                    if (event.edges.top) {
                        dy = -dy;
                    }
                    if (event.edges.left) {
                        dx = -dx;
                    }
                    var nw = parseFloat(target.style.width) + dx * 2;
                    var nh = parseFloat(target.style.height) + dy * 2;
                    _this.setSize(nw, nh);
                });
            });
        };
        baseForm.prototype.onCommand = function (cmd) {
            if (this.commandHandler !== null) {
                this.commandHandler(cmd);
            }
        };
        baseForm.attachResizeHandler = function () {
            $(window).on('resize.forms', function () {
                //let body = $("body");
                //baseForm.bodyHeight = body.height();
                //baseForm.bodyWidth = body.width();
                baseForm.bodyHeight = window.innerHeight;
                baseForm.bodyWidth = window.innerWidth;
                var cf = baseForm.formStack.peek();
                var f = $("#" + cf.id);
                var currentForm = cf.f;
                var h = f.height();
                var w = f.width();
                if (baseForm.bodyHeight - h < 0 || baseForm.bodyWidth - w < 0) {
                    currentForm.resize();
                }
                else {
                    currentForm.centre(w, h);
                }
            });
        };
        baseForm.detachResizeHandler = function () {
            $(window).off("resize.forms");
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
        return baseForm;
    }());
    baseForm.formStack = new collections.Stack();
    baseForm.bodyHeight = 0;
    baseForm.bodyWidth = 0;
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
            var _this = _super.call(this, options) || this;
            _this.modelGroup = null;
            _this.result = null;
            _this.promise = null;
            return _this;
        }
        form.prototype.getTemplate = function () {
            var _this = this;
            return _super.prototype.getTemplate.call(this).then(function (template) {
                if (_this.options.templateName !== null) {
                    return fastnet.template.fetch(_this.options.templateName).then(function (htmlFragment) {
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
            });
        };
        /**
         * Show the form - promise returns when the form is closed
         * Both okcommand and cancelcommand automatically close the form
         * okcommand will be ignored if the form model is not valid
         * Promise parameter is true if okcommand, false if cancelcommand, or else null
         * There is no way to stop the form closing at this point - use the option beforeClose to
         * do some processing/prevent closure.
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
                            if (_this.modelGroup !== null && _this.modelGroup.isValid() === false) {
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
                            break;
                    }
                    if (cmd.command !== commands.okcommand && cmd.command !== commands.cancelcommand) {
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
            var _this = this;
            if (this.options.beforeClose !== null) {
                this.options.beforeClose(this.result === null ? true : this.result).then(function (r) {
                    if (r) {
                        _this._close();
                    }
                });
            }
            else {
                this._close();
            }
        };
        form.prototype._close = function () {
            fastnet.koHelper.unBind("#forms-container #" + this.Id); //okk
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
            if (validateWholeModel) {
                this.modelGroup = ko.validatedObservable(model);
            }
            fastnet.koHelper.bind(model, "#forms-container #" + this.Id); //okk
        };
        form.prototype.enableCommand = function (cmd) {
            fastnet.command.enable(cmd, "#" + this.Id);
        };
        form.prototype.disableCommand = function (cmd) {
            fastnet.command.disable(cmd, "#" + this.Id);
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
            var formHtml = "<div class='form'>\n                    <div class='caption-bar'></div>\n                    <div class='form-body'></div>\n                    <div class='command-bar'>\n                        <span data-command='okcommand' class='btn btn-confirm btn-small'>" + this.options.okButtonCaption + "</span>\n                        <span data-command='cancelcommand' class='btn btn-cancel btn-small'>" + this.options.cancelButtonCaption + "</span>\n                    </div>\n                </div>";
            var f = $(baseTemplate).find(".form-modal").append(formHtml).parent();
            f.find(".caption-bar").append(title);
            f.find(".form-body").append($(templateBody));
            if (this.options.cancelButtonRemove) {
                f.find("span[data-command='cancelcommand']").hide();
            }
            else if (this.options.cancelButtonCaption !== null) {
                f.find("span[data-command='cancelcommand']").text(this.options.cancelButtonCaption);
            }
            if (this.options.okButtonRemove) {
                f.find("span[data-command='okcommand']").hide();
            }
            else if (this.options.okButtonCaption !== null) {
                f.find("span[data-command='okcommand']").text(this.options.okButtonCaption);
            }
            if (this.options.cancelButtonRemove && this.options.okButtonRemove) {
                f.find(".command-bar").hide();
            }
            return f.get(0).outerHTML;
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
        /**
         * Creates a modal messagebox
         * @param caption the text to use in the caption bar
         * @param body the html for the body of the message box
         * @param options an optional instance of messageBoxOptions - controls appearance of messagebox buttons
         */
        function messageBox(options) {
            if (options === void 0) { options = { caption: "Message", template: "<span>no message body<span>" }; }
            var _this = _super.call(this, options) || this;
            if (options.caption === undefined || options.caption === null) {
                options.caption = "Message";
            }
            if (options.template === undefined || options.template === null) {
                options.template = "<span>no message body<span>";
            }
            _this.options.sizeRatio = 0.25;
            return _this;
        }
        messageBox.prototype.getTemplate = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _super.prototype.getTemplate.call(_this).then(function (template) {
                    var temp = $(template);
                    temp.find(".form-modal").addClass("message-box");
                    temp.find(".form-body").addClass("message-body");
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