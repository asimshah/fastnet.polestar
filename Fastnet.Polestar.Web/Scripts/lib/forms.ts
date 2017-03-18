/// <reference path="../package.d.ts" />
namespace fastnet {
    export enum commands {
        cancelcommand = 10100,
        okcommand
    }
    /**
     * Set options for a form
     */
    export interface formOptions {
        /**
         * Set true to show a modal form. Default is true.
         * (modeless forms are not yet supported)
         */
        modal?: boolean;
        caption?: string;
        /**
         * One or more classes to add to the root div for this form
         * Class names should be space separated.
         * The root div for a form is the one with the unique id value inside #forms-container
         */
        classNames?: string;
        /**
         * Method that receives all command events (i.e. data-command element clicks)         
         */
        onCommand?: (cmd: receivedCommand) => void;
        /**
         * Name of template to fetch from the server (to use as body of form)
         */
        templateName?: string;
        /**
         * Template to use as body of form (not used if templateName is specified)
         */
        template?: string;
        /**
         * Removes the ok button
         */
        okButtonRemove?: boolean;
        /**
         * Sets the text of the ok button - default is "OK"
         */
        okButtonCaption?: string;// = null;
        /**
         * Removes the cancel buttons
         */
        cancelButtonRemove?: boolean;
        /**
         * Sets the cancel button text - default is "Cancel"
         */
        cancelButtonCaption?: string;// = null;
        /**
         * Function to call after the form is displayed
         * (The form html is sure to be in the DOM at this point)
         */
        afterDisplay?: () => void;
        /**
         * Function to call before the form closes.
         * result: true if okCommand, false if cancelCommand
         * return: false to stop the form closing
         */
        beforeClose?: (result: boolean) => Promise<boolean>
        /**
         * size ratio: dynamically change to this
         * ratio of the body size (if > 0.0)
         */
        sizeRatio?: number;
        // /**
        //  * Function to call when the value of any monitored property changes
        //  */
        // onPropertyChanged?: (name: string, originalValue: any, newValue: any) => void;
    }

    export abstract class baseForm {
        private static formStack = new collections.Stack<{ id: string, f: baseForm }>();
        private static bodyHeight: number = 0;
        private static bodyWidth: number = 0;
        protected id: string;
        protected options: formOptions = null;
        private interactable: Interact.Interactable;
        private commandHandler: (cmd: receivedCommand) => void = null;
        constructor(options?: formOptions) {
            var defaultOptions: formOptions = {
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
            let instance = baseForm.formStack.size();
            this.id = `fastnet-form-${instance}`;
            baseForm.formStack.push({ id: this.id, f: this })
        }
        public get Id(): string {
            return this.id;
        }
        public bindCommands(): void {
            command.attach(`#${this.id}`, (cmd: receivedCommand) => {
                this.onCommand(cmd);
            });
        }
        protected display(onCommand: (cmd: receivedCommand) => void) {
            var finaliseDisplay = () => {
                // **NB** the following code adding classnames was originally in 
                // openModal but it was losing the value of this when inside that method
                // in the case where the template was fetched asynchronously
                // I was never able to solve that so I've moved it here
                // if (this.options.classNames !== undefined && this.options.classNames.length > 0) {
                //     $(`#${this.id}`).addClass(this.options.classNames);
                // }
                if (f$.isUndefinedOrNull(this.options.classNames) === false && this.options.classNames.length > 0) {
                    $(`#${this.id}`).addClass(this.options.classNames);
                }
                if (this.options.afterDisplay !== null) {
                    this.options.afterDisplay();
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

                this.resize();
                this.bindCommands();
                // command.attach(`#${this.id}`, (cmd: receivedCommand) => {
                //     this.onCommand(cmd);
                // });
            }
            this.commandHandler = onCommand;
            if (this.options.modal) {
                this.openModal().then(() => {
                    //debug.print(this.id);
                    finaliseDisplay();
                });
            } else {
                debug.print(`modeless form not implemented`);
            }

        }
        /**
         * Detach all commands (i.e. data-command elements)
         * Remove the form from the DOM
         * Remove the forms container from the DOM if this is the last form
         */
        protected close() {
            command.detach(`#${this.id}`);
            let f = baseForm.formStack.pop();
            $(`#${f.id}`).closest(".form-root").remove();
            if (baseForm.formStack.size() === 0) {
                $("body > #forms-container").hide(); // okk
                baseForm.detachResizeHandler();
            } else {
                let cf = baseForm.formStack.peek();
                cf.f.resize();
            }
        }
        protected getTemplate(): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                resolve(`<div class='form-root'><div class='form-modal' id='${this.id}'></div></div>`);
            });
        }

        private ensureContainer() {
            var container = $("body > #forms-container");
            if (container.length === 0) {
                var template = `<div id='forms-container'></div>`; // okk `<div id='forms-container'><div class='form-list'></div?</div>`
                $("body").append($(template));
                container = $("body > #forms-container");
            }
            container.show();
        }
        private resize(): void {
            let r = this.options.sizeRatio;
            let h = baseForm.bodyHeight * r;// bh * r;
            let w = baseForm.bodyWidth * r;//bw * r;
            this.setSize(w, h);
        }
        private setSize(w: number, h: number) {
            //$(`#${this.id}`).height(h);
            //$(`#${this.id}`).width(w);
            this.centre(w, h);
        }
        private centre(w: number, h: number) {
            let formRoot = $(`#${this.id}`).parent();
            let bh = baseForm.bodyHeight;
            let bw = baseForm.bodyWidth;
            let availHeight = bh - h;
            let availWidth = bw - w;
            formRoot.css("top", availHeight / 2);
            formRoot.css("left", availWidth / 2);
        }
        private openModal(): Promise<void> {
            this.ensureContainer();
            return this.getTemplate().then((template) => {
                // var modaltemplate = this.modifyTemplate(template);
                $("#forms-container").append($(template));
                let element = $(`#${this.id}`).get(0);

                this.interactable = interact(element);
                this.interactable

                    .resizable({
                        edges: { left: true, right: true, bottom: true, top: true }
                    })
                    .on('resizemove', (event) => {
                        let target = event.target;
                        let dx: number = event.dx;
                        let dy: number = event.dy;
                        if (event.edges.top) {
                            dy = -dy;
                        }
                        if (event.edges.left) {
                            dx = -dx;
                        }
                        let nw = parseFloat(target.style.width) + dx * 2;
                        let nh = parseFloat(target.style.height) + dy * 2;
                        this.setSize(nw, nh);
                    });

            });

        }
        private onCommand(cmd: receivedCommand) {
            if (this.commandHandler !== null) {
                this.commandHandler(cmd);
            }
        }
        private static attachResizeHandler(): void {
            $(window).on('resize.forms', () => {
                //let body = $("body");
                //baseForm.bodyHeight = body.height();
                //baseForm.bodyWidth = body.width();
                baseForm.bodyHeight = window.innerHeight;
                baseForm.bodyWidth = window.innerWidth;
                let cf = baseForm.formStack.peek();
                let f = $(`#${cf.id}`);
                let currentForm = cf.f;
                let h = f.height();
                let w = f.width();
                if (baseForm.bodyHeight - h < 0 || baseForm.bodyWidth - w < 0) {
                    currentForm.resize();
                } else {
                    currentForm.centre(w, h);
                }
            });
        }
        private static detachResizeHandler(): void {
            $(window).off("resize.forms");
        }
        private dragMoveListener(event) {
            var target = event.target,
                // keep the dragged position in the data-x/data-y attributes
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translate the element
            target.style.webkitTransform =
                target.style.transform =
                'translate(' + x + 'px, ' + y + 'px)';

            // update the posiion attributes
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }
    }
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
    export class form extends baseForm {
        private modelGroup: KnockoutValidationGroup = null;
        protected result: boolean = null;
        protected promise: Promise<boolean> = null;
        protected resolver: (value?: boolean | Thenable<boolean>) => void;
        constructor(options?: formOptions) {
            super(options);
        }

        protected getTemplate(): Promise<string> {
            return super.getTemplate().then((template) => {
                if (this.options.templateName !== null) {
                    return fastnet.template.fetch(this.options.templateName).then((htmlFragment) => {
                        return this.buildForm(template, htmlFragment)
                    });
                } else {
                    return new Promise<string>((resolve, reject) => {
                        if (this.options.template !== null) {
                            // use the provided template and combine it
                            resolve(this.buildForm(template, this.options.template));
                        } else {
                            resolve(template);
                        }
                    });
                };
            });
        }
        /**
         * Show the form - promise returns when the form is closed
         * Both okcommand and cancelcommand automatically close the form
         * okcommand will be ignored if the form model is not valid
         * Promise parameter is true if okcommand, false if cancelcommand, or else null
         * There is no way to stop the form closing at this point - use the option beforeClose to
         * do some processing/prevent closure.
         */
        public show(): Promise<boolean> {
            this.promise = new Promise<boolean>((resolve, reject) => {
                this.resolver = resolve;
                super.display((cmd: receivedCommand) => {
                    var shouldClose: boolean = false;
                    switch (cmd.command) {
                        case commands.okcommand:
                            var canClose: boolean = true;
                            if (this.modelGroup !== null && this.modelGroup.isValid() === false) {
                                this.modelGroup.errors.showAllMessages();
                                canClose = false;
                            }
                            if (canClose) {
                                this.result = true;
                                shouldClose = true;
                                //this.close();
                            }
                            break;
                        case commands.cancelcommand:
                            this.result = false;
                            shouldClose = true;
                            break;
                    }
                    if (cmd.command !== commands.okcommand && cmd.command !== commands.cancelcommand) {
                        if (this.options.onCommand === null) {
                            debug.print(`form ${this.id}: command ${cmd.commandName}, no onCommand handler provided`);
                        } else {
                            this.options.onCommand(cmd);
                        }
                    }
                    if (shouldClose) {
                        this.close();
                    }
                });
            });
            return this.promise;
        }
        public close() {
            if (this.options.beforeClose !== null) {
                this.options.beforeClose(this.result === null ? true : this.result).then((r) => {
                    if (r) {
                        this._close();
                    }
                });
            } else {
                this._close();
            }
        }
        private _close() {
            koHelper.unBind(`#forms-container #${this.Id}`) //okk
            super.close();
            this.resolver(this.result);
        }
        /**
         * Bind a datamodel to the form
         * Validation rules can, and should, be specified for model properties
         * The entire model will also be validated (unless validateWholeModel is set false)         
         */
        public bindModel(model: any, validateWholeModel: boolean = true) {
            if (validateWholeModel) {
                this.modelGroup = ko.validatedObservable(model);
            }
            koHelper.bind(model, `#forms-container #${this.Id}`) //okk
        }
        public enableCommand(cmd: commands): void {
            command.enable(cmd, "#" + this.Id);
        }
        public disableCommand(cmd: commands): void {
            command.disable(cmd, "#" + this.Id);
        }
        /**
         * return true if all the model properties are valid, or if validation has been turned off.
         */
        public isValid(): boolean {
            return this.modelGroup === null ? true : this.modelGroup.isValid();
        }
        /**
         * returns an string array of current error messages
         * empty if there are no errors
         */
        public getErrors(): string[] {
            if (this.modelGroup === null ? true : this.modelGroup.isValid()) {
                return [];
            } else {
                return this.modelGroup.errors();
            }
        }
        private buildForm(baseTemplate: string, templateBody: string): string {
            var title: JQuery = null;
            var r = /<[a-z][\s\S]*>/;
            if (r.test(this.options.caption)) {
                title = $(this.options.caption);
            } else {
                title = $("<span></span>").text(this.options.caption);
            }
            let formHtml =
                `<div class='form'>
                    <div class='caption-bar'></div>
                    <div class='form-body'></div>
                    <div class='command-bar'>
                        <span data-command='okcommand' class='btn btn-confirm btn-small'>${this.options.okButtonCaption}</span>
                        <span data-command='cancelcommand' class='btn btn-cancel btn-small'>${this.options.cancelButtonCaption}</span>
                    </div>
                </div>`;
            let f = $(baseTemplate).find(".form-modal").append(formHtml).parent();
            f.find(".caption-bar").append(title);
            f.find(".form-body").append($(templateBody));
            if (this.options.cancelButtonRemove) {
                f.find("span[data-command='cancelcommand']").hide();
            } else if (this.options.cancelButtonCaption !== null) {
                f.find("span[data-command='cancelcommand']").text(this.options.cancelButtonCaption);
            }
            if (this.options.okButtonRemove) {
                f.find("span[data-command='okcommand']").hide();
            } else if (this.options.okButtonCaption !== null) {
                f.find("span[data-command='okcommand']").text(this.options.okButtonCaption);
            }
            if (this.options.cancelButtonRemove && this.options.okButtonRemove) {
                f.find(".command-bar").hide();
            }
            return f.get(0).outerHTML;
        }
    }
    /**
     * Sets options for a messagebox
     * If both buttons are disabled, the message box must be closed in code
     */

    export class messageBox extends form {
        /**
         * Creates a modal messagebox
         * @param caption the text to use in the caption bar
         * @param body the html for the body of the message box
         * @param options an optional instance of messageBoxOptions - controls appearance of messagebox buttons
         */
        constructor(options: formOptions = { caption: "Message", template: "<span>no message body<span>" }) {
            super(options);
            if (options.caption === undefined || options.caption === null) {
                options.caption = "Message";
            }
            if (options.template === undefined || options.template === null) {
                options.template = "<span>no message body<span>";
            }
            this.options.sizeRatio = 0.25;
        }
        protected getTemplate(): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                super.getTemplate().then((template) => {
                    var temp = $(template);
                    temp.find(".form-modal").addClass("message-box");
                    temp.find(".form-body").addClass("message-body");
                    resolve(temp.get(0).outerHTML);
                });
            });
        }
        /**
         * Show the messagebox.
         * Promise<boolean> returns on any of okcommand, cancelcommand, or close()
         * Returned value is true if okcommand, false, if cancelcommand, or null if close()
         */
        public show(): Promise<boolean> {
            this.promise = new Promise<boolean>((resolve, reject) => {
                this.resolver = resolve;
                super.display((cmd: receivedCommand) => {
                    //var result = false;
                    switch (cmd.command) {
                        case commands.okcommand:
                            this.result = true;
                            break;
                    }
                    this.close();
                    //resolve(result);
                });
            });
            return this.promise;
        }
    }
}