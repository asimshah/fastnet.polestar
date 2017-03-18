/// <reference path="../package.d.ts" />
interface KnockoutObservable<T> {
    hasError: KnockoutObservable<boolean>;
    validationMessage: KnockoutObservable<string>;
}
interface KnockoutBindingHandlers {
    moment: KnockoutBindingHandler;
}
namespace fastnet {
    (() => {
        setupKnockout();
    })();
    function setupKnockout() {
        /*
         * read-only date display with momentjs
         * use like this: data-bind="moment: dateVar, format: 'YYYY-MM-DD'"
         * The "format" is optional and will default to "MM/DD/YYYY"
         */
        ko.bindingHandlers.moment = {
            update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                let date: moment.Moment = null;
                let format = fastnet.date.stdDateFormat;
                let formatted = '**INVALID**'; // throw instead?
                let val = ko.utils.unwrapObservable(valueAccessor());
                let outputUtc = false;
                if (typeof val === 'object' && val.value !== undefined) {
                    if (val.isUtc !== undefined && val.isUtc === true) {
                        date = fastnet.date.toMomentUtc(val.value);
                    } else {
                        date = fastnet.date.toMoment(val.value);
                    }

                    if (val.format !== undefined) {
                        switch ((<string>(val.format)).toLowerCase()) {
                            case "stddate":
                                format = fastnet.date.stdDateFormat;
                                break;
                            case "stddatetime":
                                format = fastnet.date.stdDateTimeFormat;
                                break;
                            case "stddatetimesec":
                                format = fastnet.date.stdDateTimeSecFormat;
                                break;
                            case "stddateutc":
                                format = fastnet.date.stdDateFormat;
                                outputUtc = true;
                                break;
                            case "stddatetimeutc":
                                format = fastnet.date.stdDateTimeFormat;
                                outputUtc = true;
                                break;
                            case "stddatetimesecutc":
                                format = fastnet.date.stdDateTimeSecFormat;
                                outputUtc = true;
                                break;
                            default:
                                format = <string>(val.format);
                                break;
                        }
                    }
                } else {
                    date = fastnet.date.toMoment(val);
                }
                if (date && date.isValid()) {

                    formatted = outputUtc? date.utc().format(format) + " UTC" : date.local().format(format);
                }

                element.innerText = formatted;
            }
        };

    }
    // export interface validatableModel {
    //     hasError: KnockoutObservable<boolean>;
    //     validationMessage: KnockoutObservable<string>;
    // }
    // knockout model container: use this as viewmodel when the contained model needs to be replaceable
    export class koContainer<T> {
        public model: KnockoutObservable<T> = ko.observable<T>(null);
    }
    // knockout-validation (kv)
    // some additional guidance
    // 1. kv.init() once called, does not do anything on subsequemt calls (unless you set force = true)
    // 2. kv.init() calls registerExtenders by default. Not sure how to prevent this given point (3)
    // 3. kv replaces the ko.applybindings method with one of its own which first calls kv.init().
    //    If ko.applybindings is used multiple times (on different root elements, for example) then this
    //    creates uncertainty about the point at which init() was called and therefore the point at which
    //    registerExtenders is called.
    // 4. registerExtenders can be safely called multiple times as it will only register additional rules, i.e.
    //    rules that it has not previously registered (note: rules are known uniquely by name) 
    // 5. Safest thing is to always call registerExtenders again after adding a rule (using ko.validation.rules[xxx] =)
    // 6. Further experimentation shows that ko.validation.init() is best called once and as early as possible if non
    //    options are required.
    //
    /**
     * 
     */
    export class koHelper {
        private static boundElements: HTMLElement[] = [];
        private static isBound(element: HTMLElement) {
            //var index = koh.boundElements.indexOf(element);
            var index = koHelper.findElementIndex(element);
            return index >= 0;
        }
        private static findElementIndex(element: HTMLElement): number {
            var result = -1;
            var a = $(element);
            $.each(koHelper.boundElements, (i, item) => {
                if (a.is($(item))) {
                    result = i;
                    return false;
                }
            });
            return result;
        }
        private static removeElement(element: HTMLElement) {
            //var index = koh.boundElements.indexOf(element);
            var index = koHelper.findElementIndex(element);
            if (index !== -1) {
                koHelper.boundElements.splice(index, 1);
            }
        }
        public static unBind(element: JQuery | Element | string) {
            var target = toJQuery(element).get(0);
            if (koHelper.isBound(target)) {
                ko.cleanNode(target);
                koHelper.removeElement(target);
            }
        }
        /**
         * Apply a knockout binding at "element" using "model". Any existing binding at the same target will be removed
         * @param model  the data model to bind to
         * @param element the element in the document at which to bind - can be a selector, an Element or a jquery object
         */
        public static bind(model: any, element: JQuery | Element | string) {
            var target = toJQuery(element).get(0);
            if (koHelper.isBound(target)) {
                koHelper.unBind(target);
            }
            ko.applyBindings(model, target);
            koHelper.boundElements.push(target);
        }
        /**
         * Clear all knockout bindings performed using koHelper.bind().
         */
        public static clear() {
            $.each(koHelper.boundElements, (index, item) => {
                ko.cleanNode(item);
            });
            koHelper.boundElements = [];
        }
        /**
         * Initialises knockout-validation using fastnet defaults.
         * These no setting of the title attribute, adding a 'validation-error' class to input on error, and
         * automatic inserting of a span for the error message with a class of 'validationMessage'
         */
        public static initialiseValidation() {
            ko.validation.init({
                errorsAsTitle: false,
                decorateInputElement: true,
                errorElementClass: 'validation-error'
            });
        }
        /**
         * Adds standard fastnet validation rules
         * exclusionList - set "exclude" to an array of strings to exclude, e.g. exclude: ["abc", "def"]
         */
        public static addStandardAdditionalValidationRules() {
            ko.validation.rules["exclusionList"] = {
                validator: (newValue, options) => {
                    var r = options.find((s) => {
                        return s === newValue;
                    });
                    return r === null;
                },
                message: "This item already exists"
            };
            ko.validation.registerExtenders();
        }
    }

    // export interface validationOptions {
    //     errorMessage?: string;
    // }
    // export class validationRules {
    //     public AddStandardRules() {
    //         this.AddValidationRule<any, validationOptions>("required", (newValue, opt) => {
    //             var result = false;
    //             // if (newValue === undefined || newValue.trim().length > 0) {
    //             //     result = true;
    //             // }
    //             if (newValue !== undefined && newValue.trim().length > 0) {
    //                 result = true;
    //             }
    //             return result;
    //         }, "This field is required");
    //     }
    //     public AddValidationRule<T, O extends validationOptions>(name: string, validator: (newValue: T, o: O) => boolean, errorMessage: string) {
    //         if (ko.extenders[name] === undefined) {
    //             ko.extenders[name] = (t: KnockoutObservable<T>, o: O) => {
    //                 this.validationExtension.call(this, t, validator, errorMessage, o);
    //             };
    //         }
    //     }
    //     private validationExtension<T, O extends validationOptions>(target: KnockoutObservable<T>, validator: (p: T, o?: O) => boolean, defaultErrorMessage: string, options?: O): KnockoutObservable<T> {
    //         target.hasError = ko.observable<boolean>();
    //         target.validationMessage = ko.observable<string>();
    //         var validate = (newValue: T) => {
    //             var result = validator(newValue, options);
    //             target.hasError(!result);
    //             target.validationMessage(result ? "" : this.getErrorMessage(defaultErrorMessage, options));
    //         };
    //         validate(target());
    //         target.subscribe(validate);
    //         return target;
    //     }
    //     private getErrorMessage(defaultErrorMessage: string, opt: validationOptions) {
    //         if (!f$.isUndefinedOrNull(opt) && !f$.isUndefinedOrNull(opt.errorMessage)) {
    //             return opt.errorMessage;
    //         } else {
    //             return defaultErrorMessage;
    //         }
    //     }
    // }
    export abstract class elementTag {
        protected tagName: string;
        constructor(tag: string) {
            this.tagName = tag.toLowerCase();
        }
        public register() {
            ko.components.register(this.tagName, this.getComponentConfig());
        }
        private getComponentConfig(): KnockoutComponentTypes.Config {
            return {
                viewModel: this.getViewModel(),
                template: this.getTemplate()
                // LEAVE THIS HERE AS AN EXAMPLE FOR DYNAMIC TEMPLATING
                //createTemplateForViewModel: function (vm: toggleViewModel) {
                //    var templ = `<span data-bind='attr: { class : getClass()}'></span><span data-bind='text: label'></span>`;
                //    return templ;
                //}
            }
        }
        public getTemplate(): string {
            return null;
        }
        public getViewModel(): KnockoutComponentTypes.ViewModelFactoryFunction {
            return null;
        }
    }
    export abstract class toggletag extends elementTag {
        constructor(tag: string, private downClass: string, private upClass: string, private defaultLabel: string = null) {
            super(tag);
        }
        public getTemplate(): string {
            return `<span data-bind='attr: { class : getClass()}'></span><!-- ko if hasLabel --><span class='label' data-bind='text: label'></span><!-- /ko -->`;
        }
        protected createViewModel(params, componentInfo): any {
            var hasGroup = false;
            var group = $(componentInfo.element).attr("data-group");
            if (group !== undefined) {
                hasGroup = true;
                //debug.print(`group ${group}`);
            }
            ko.utils.domNodeDisposal.addDisposeCallback(componentInfo.element, () => {
                var vm = ko.dataFor($(componentInfo.element).children()[0]);
                //debug.print(`element ${vm.getIdent()} disposed`);
            });
            var labelText = params.hasOwnProperty("label") ? ko.unwrap<string>(params.label) : this.defaultLabel;// "no label";
            var checked = params.hasOwnProperty("checked") ? ko.unwrap<boolean>(params.checked) : false;
            this.downClass = params.hasOwnProperty("down") ? ko.unwrap<string>(params.down) : this.downClass;
            this.upClass = params.hasOwnProperty("up") ? ko.unwrap<string>(params.up) : this.upClass;
            var vm = new toggleViewModel(componentInfo.element, labelText, checked, this.downClass, this.upClass);
            if (hasGroup) {
                vm.addToGroup(group);
            }
            $(componentInfo.element).on("changeState", (e, state) => {
                //debugger;
                vm.isChecked(state);
            });
            //debug.print(`toggleViewModel ${vm.getIdent()} created`);
            return vm;
        };
        public getViewModel(): KnockoutComponentTypes.ViewModelFactoryFunction {
            return {
                createViewModel: (p, ci) => { return this.createViewModel(p, ci); }
            };
        }
    }
    class checkboxTag extends toggletag {
        constructor() {
            super("check-box", "fa-check-square-o", "fa-square-o", "no label");
        }
    }
    class radioButtonTag extends toggletag {
        constructor() {
            super("radio-button", "fa-circle", "fa-circle-o", "no label");
        }
    }
    class imageButtonTag extends toggletag {
        constructor() {
            super("image-button", "fa-question", "fa-question fa-rotate-180");
        }
    }

    export abstract class elementViewModel {
        private static count = 0;
        private static controlLoader: KnockoutComponentTypes.Loader = {
            // note: this loader allows the template to be modified based on the current viewModel
            // BUT I did not need this feature for the toggleViewModel based components.
            // I have left this here in c ase I do need it eventually ...
            // For the present this component loader is not itself loaded 
            loadComponent: function (componentName, config: any, callback) {
                function newCallback(definition: KnockoutComponentTypes.Definition) {
                    if (config.createTemplateForViewModel && definition.createViewModel && (!definition.template || !definition.template.length)) {
                        callback({
                            template: [],
                            createViewModel: function (params, componentInfo) {
                                var componentVM = definition.createViewModel.call(this, params, componentInfo);
                                var template = config.createTemplateForViewModel.call(this, componentVM, componentInfo);
                                if (typeof template === 'string') {
                                    template = ko.utils.parseHtmlFragment(template);
                                }
                                ko.virtualElements.setDomNodeChildren(componentInfo.element, template);
                                return componentVM;
                            }
                        });
                    } else {
                        callback(definition);
                    }
                }
                ko.components.defaultLoader.loadComponent(componentName, config, newCallback);
            }
        };
        public static init() {
            //ko.components.loaders.unshift(controlViewModel.controlLoader);
            elementViewModel.register(checkboxTag);
            elementViewModel.register(radioButtonTag);
            elementViewModel.register(imageButtonTag);
        }
        private static register<T extends elementTag>(c: { new (): T }) {
            var et = new c();
            et.register();
        }
        public static getVmForElement(element: Element): elementViewModel {
            return ko.dataFor(element);
        }
        public key: number = 0;
        constructor(public element: Element) {
            this.key = elementViewModel.count++;
        }
        public handleEvent(eventname: string) {

        }
        public getIdent(): string {
            return `${this.element.tagName.toLowerCase()}-${this.key}`;
        }
        public dispose() {
            debug.print(`disposing ${this.getIdent()}`);
        }
    }
    export class toggleViewModel extends elementViewModel {
        //collections.Dictionary<Person, collections.LinkedList<Car>>();
        private static groups = new collections.Dictionary<string, collections.LinkedList<toggleViewModel>>();
        public label: string;
        public isChecked: KnockoutObservable<boolean>;
        public hasLabel: boolean;
        private groupName: string = null;
        constructor(element: Element, labelText: string, checked: boolean, private downClass, private upClass) {
            super(element);
            this.label = labelText !== null ? labelText.trim() : null;
            this.hasLabel = this.label !== null && this.label.length > 0;
            this.isChecked = ko.observable<boolean>();
            this.isChecked.subscribe((newValue) => {
                this.setElementChecked(newValue);
            });
            this.isChecked(checked);
        }
        private setElementChecked(value: boolean) {
            if (value) {
                $(this.element).attr("checked", "true");
            } else {
                $(this.element).removeAttr("checked");
            }
        }
        public getClass() {

            var classes = `image fa  ${this.isChecked() ? this.downClass : this.upClass} clickable`;
            var tag = this.element.tagName.toLowerCase();
            if (tag === "radio-button") {
                debug.print(`${this.element.tagName} - ${this.getIdent()}: checked is ${this.isChecked()}, down class is ${this.downClass} up class is ${this.upClass}, result is ${classes}`);
            }
            return classes;
        }
        public handleEvent(eventName: string) {
            var checkedState = this.isChecked();
            this.isChecked(!checkedState);
            if (this.groupName !== null && this.isChecked() && toggleViewModel.groups.containsKey(this.groupName)) {
                var list = toggleViewModel.groups.getValue(this.groupName);
                list.forEach((vm) => {
                    if (vm !== this) {
                        vm.isChecked(false);
                    }
                    return true;
                });
            }
        }
        public dispose() {
            if (this.groupName !== null) {
                this.removeFromGroup();
            }
        }
        public addToGroup(name: string) {
            this.groupName = name.toLowerCase();
            if (!toggleViewModel.groups.containsKey(this.groupName)) {
                toggleViewModel.groups.setValue(this.groupName, new collections.LinkedList<toggleViewModel>());
            }
            toggleViewModel.groups.getValue(this.groupName).add(this);
        }
        private removeFromGroup() {
            if (this.groupName !== null) {
                if (toggleViewModel.groups.containsKey(this.groupName)) {
                    var list = toggleViewModel.groups.getValue(this.groupName);
                    if (list.contains(this)) {
                        list.remove(this);
                        if (list.size() === 0) {
                            toggleViewModel.groups.remove(this.groupName);
                        }
                    }
                }
            }
        }
    }
}