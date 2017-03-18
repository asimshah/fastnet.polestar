var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../package.d.ts" />
var fastnet;
(function (fastnet) {
    (function () {
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
                var date = null;
                var format = fastnet.date.stdDateFormat;
                var formatted = '**INVALID**'; // throw instead?
                var val = ko.utils.unwrapObservable(valueAccessor());
                var outputUtc = false;
                if (typeof val === 'object' && val.value !== undefined) {
                    if (val.isUtc !== undefined && val.isUtc === true) {
                        date = fastnet.date.toMomentUtc(val.value);
                    }
                    else {
                        date = fastnet.date.toMoment(val.value);
                    }
                    if (val.format !== undefined) {
                        switch ((val.format).toLowerCase()) {
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
                                format = (val.format);
                                break;
                        }
                    }
                }
                else {
                    date = fastnet.date.toMoment(val);
                }
                if (date && date.isValid()) {
                    formatted = outputUtc ? date.utc().format(format) + " UTC" : date.local().format(format);
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
    var koContainer = (function () {
        function koContainer() {
            this.model = ko.observable(null);
        }
        return koContainer;
    }());
    fastnet.koContainer = koContainer;
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
    var koHelper = (function () {
        function koHelper() {
        }
        koHelper.isBound = function (element) {
            //var index = koh.boundElements.indexOf(element);
            var index = koHelper.findElementIndex(element);
            return index >= 0;
        };
        koHelper.findElementIndex = function (element) {
            var result = -1;
            var a = $(element);
            $.each(koHelper.boundElements, function (i, item) {
                if (a.is($(item))) {
                    result = i;
                    return false;
                }
            });
            return result;
        };
        koHelper.removeElement = function (element) {
            //var index = koh.boundElements.indexOf(element);
            var index = koHelper.findElementIndex(element);
            if (index !== -1) {
                koHelper.boundElements.splice(index, 1);
            }
        };
        koHelper.unBind = function (element) {
            var target = fastnet.toJQuery(element).get(0);
            if (koHelper.isBound(target)) {
                ko.cleanNode(target);
                koHelper.removeElement(target);
            }
        };
        /**
         * Apply a knockout binding at "element" using "model". Any existing binding at the same target will be removed
         * @param model  the data model to bind to
         * @param element the element in the document at which to bind - can be a selector, an Element or a jquery object
         */
        koHelper.bind = function (model, element) {
            var target = fastnet.toJQuery(element).get(0);
            if (koHelper.isBound(target)) {
                koHelper.unBind(target);
            }
            ko.applyBindings(model, target);
            koHelper.boundElements.push(target);
        };
        /**
         * Clear all knockout bindings performed using koHelper.bind().
         */
        koHelper.clear = function () {
            $.each(koHelper.boundElements, function (index, item) {
                ko.cleanNode(item);
            });
            koHelper.boundElements = [];
        };
        /**
         * Initialises knockout-validation using fastnet defaults.
         * These no setting of the title attribute, adding a 'validation-error' class to input on error, and
         * automatic inserting of a span for the error message with a class of 'validationMessage'
         */
        koHelper.initialiseValidation = function () {
            ko.validation.init({
                errorsAsTitle: false,
                decorateInputElement: true,
                errorElementClass: 'validation-error'
            });
        };
        /**
         * Adds standard fastnet validation rules
         * exclusionList - set "exclude" to an array of strings to exclude, e.g. exclude: ["abc", "def"]
         */
        koHelper.addStandardAdditionalValidationRules = function () {
            ko.validation.rules["exclusionList"] = {
                validator: function (newValue, options) {
                    var r = options.find(function (s) {
                        return s === newValue;
                    });
                    return r === null;
                },
                message: "This item already exists"
            };
            ko.validation.registerExtenders();
        };
        koHelper.boundElements = [];
        return koHelper;
    }());
    fastnet.koHelper = koHelper;
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
    var elementTag = (function () {
        function elementTag(tag) {
            this.tagName = tag.toLowerCase();
        }
        elementTag.prototype.register = function () {
            ko.components.register(this.tagName, this.getComponentConfig());
        };
        elementTag.prototype.getComponentConfig = function () {
            return {
                viewModel: this.getViewModel(),
                template: this.getTemplate()
            };
        };
        elementTag.prototype.getTemplate = function () {
            return null;
        };
        elementTag.prototype.getViewModel = function () {
            return null;
        };
        return elementTag;
    }());
    fastnet.elementTag = elementTag;
    var toggletag = (function (_super) {
        __extends(toggletag, _super);
        function toggletag(tag, downClass, upClass, defaultLabel) {
            if (defaultLabel === void 0) { defaultLabel = null; }
            _super.call(this, tag);
            this.downClass = downClass;
            this.upClass = upClass;
            this.defaultLabel = defaultLabel;
        }
        toggletag.prototype.getTemplate = function () {
            return "<span data-bind='attr: { class : getClass()}'></span><!-- ko if hasLabel --><span class='label' data-bind='text: label'></span><!-- /ko -->";
        };
        toggletag.prototype.createViewModel = function (params, componentInfo) {
            var hasGroup = false;
            var group = $(componentInfo.element).attr("data-group");
            if (group !== undefined) {
                hasGroup = true;
            }
            ko.utils.domNodeDisposal.addDisposeCallback(componentInfo.element, function () {
                var vm = ko.dataFor($(componentInfo.element).children()[0]);
                //debug.print(`element ${vm.getIdent()} disposed`);
            });
            var labelText = params.hasOwnProperty("label") ? ko.unwrap(params.label) : this.defaultLabel; // "no label";
            var checked = params.hasOwnProperty("checked") ? ko.unwrap(params.checked) : false;
            this.downClass = params.hasOwnProperty("down") ? ko.unwrap(params.down) : this.downClass;
            this.upClass = params.hasOwnProperty("up") ? ko.unwrap(params.up) : this.upClass;
            var vm = new toggleViewModel(componentInfo.element, labelText, checked, this.downClass, this.upClass);
            if (hasGroup) {
                vm.addToGroup(group);
            }
            $(componentInfo.element).on("changeState", function (e, state) {
                //debugger;
                vm.isChecked(state);
            });
            //debug.print(`toggleViewModel ${vm.getIdent()} created`);
            return vm;
        };
        ;
        toggletag.prototype.getViewModel = function () {
            var _this = this;
            return {
                createViewModel: function (p, ci) { return _this.createViewModel(p, ci); }
            };
        };
        return toggletag;
    }(elementTag));
    fastnet.toggletag = toggletag;
    var checkboxTag = (function (_super) {
        __extends(checkboxTag, _super);
        function checkboxTag() {
            _super.call(this, "check-box", "fa-check-square-o", "fa-square-o", "no label");
        }
        return checkboxTag;
    }(toggletag));
    var radioButtonTag = (function (_super) {
        __extends(radioButtonTag, _super);
        function radioButtonTag() {
            _super.call(this, "radio-button", "fa-circle", "fa-circle-o", "no label");
        }
        return radioButtonTag;
    }(toggletag));
    var imageButtonTag = (function (_super) {
        __extends(imageButtonTag, _super);
        function imageButtonTag() {
            _super.call(this, "image-button", "fa-question", "fa-question fa-rotate-180");
        }
        return imageButtonTag;
    }(toggletag));
    var elementViewModel = (function () {
        function elementViewModel(element) {
            this.element = element;
            this.key = 0;
            this.key = elementViewModel.count++;
        }
        elementViewModel.init = function () {
            //ko.components.loaders.unshift(controlViewModel.controlLoader);
            elementViewModel.register(checkboxTag);
            elementViewModel.register(radioButtonTag);
            elementViewModel.register(imageButtonTag);
        };
        elementViewModel.register = function (c) {
            var et = new c();
            et.register();
        };
        elementViewModel.getVmForElement = function (element) {
            return ko.dataFor(element);
        };
        elementViewModel.prototype.handleEvent = function (eventname) {
        };
        elementViewModel.prototype.getIdent = function () {
            return this.element.tagName.toLowerCase() + "-" + this.key;
        };
        elementViewModel.prototype.dispose = function () {
            fastnet.debug.print("disposing " + this.getIdent());
        };
        elementViewModel.count = 0;
        elementViewModel.controlLoader = {
            // note: this loader allows the template to be modified based on the current viewModel
            // BUT I did not need this feature for the toggleViewModel based components.
            // I have left this here in c ase I do need it eventually ...
            // For the present this component loader is not itself loaded 
            loadComponent: function (componentName, config, callback) {
                function newCallback(definition) {
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
                    }
                    else {
                        callback(definition);
                    }
                }
                ko.components.defaultLoader.loadComponent(componentName, config, newCallback);
            }
        };
        return elementViewModel;
    }());
    fastnet.elementViewModel = elementViewModel;
    var toggleViewModel = (function (_super) {
        __extends(toggleViewModel, _super);
        function toggleViewModel(element, labelText, checked, downClass, upClass) {
            var _this = this;
            _super.call(this, element);
            this.downClass = downClass;
            this.upClass = upClass;
            this.groupName = null;
            this.label = labelText !== null ? labelText.trim() : null;
            this.hasLabel = this.label !== null && this.label.length > 0;
            this.isChecked = ko.observable();
            this.isChecked.subscribe(function (newValue) {
                _this.setElementChecked(newValue);
            });
            this.isChecked(checked);
        }
        toggleViewModel.prototype.setElementChecked = function (value) {
            if (value) {
                $(this.element).attr("checked", "true");
            }
            else {
                $(this.element).removeAttr("checked");
            }
        };
        toggleViewModel.prototype.getClass = function () {
            var classes = "image fa  " + (this.isChecked() ? this.downClass : this.upClass) + " clickable";
            var tag = this.element.tagName.toLowerCase();
            if (tag === "radio-button") {
                fastnet.debug.print(this.element.tagName + " - " + this.getIdent() + ": checked is " + this.isChecked() + ", down class is " + this.downClass + " up class is " + this.upClass + ", result is " + classes);
            }
            return classes;
        };
        toggleViewModel.prototype.handleEvent = function (eventName) {
            var _this = this;
            var checkedState = this.isChecked();
            this.isChecked(!checkedState);
            if (this.groupName !== null && this.isChecked() && toggleViewModel.groups.containsKey(this.groupName)) {
                var list = toggleViewModel.groups.getValue(this.groupName);
                list.forEach(function (vm) {
                    if (vm !== _this) {
                        vm.isChecked(false);
                    }
                    return true;
                });
            }
        };
        toggleViewModel.prototype.dispose = function () {
            if (this.groupName !== null) {
                this.removeFromGroup();
            }
        };
        toggleViewModel.prototype.addToGroup = function (name) {
            this.groupName = name.toLowerCase();
            if (!toggleViewModel.groups.containsKey(this.groupName)) {
                toggleViewModel.groups.setValue(this.groupName, new collections.LinkedList());
            }
            toggleViewModel.groups.getValue(this.groupName).add(this);
        };
        toggleViewModel.prototype.removeFromGroup = function () {
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
        };
        //collections.Dictionary<Person, collections.LinkedList<Car>>();
        toggleViewModel.groups = new collections.Dictionary();
        return toggleViewModel;
    }(elementViewModel));
    fastnet.toggleViewModel = toggleViewModel;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=knockout.js.map