/// <reference path="../package.d.ts" />
var fastnet;
(function (fastnet) {
    var busyIndicator = (function () {
        function busyIndicator() {
            this.overlay = "<div class='block-overlay'>                        \n            <div class='indicator'>\n                <div class='message'></div>\n                <div class='animation'><i class=\"fa fa-gear fa-spin fa-3x\"></i></div>\n            </div>\n         </div>";
        }
        busyIndicator.prototype.block = function (message) {
            if (!busyIndicator.isBlocked) {
                var overlayElement = document.createElement("div");
                overlayElement.innerHTML = this.overlay;
                document.body.appendChild(overlayElement);
                if (message !== undefined) {
                    var nodes = overlayElement.getElementsByClassName("message");
                    nodes.item(0).innerHTML = message;
                }
                busyIndicator.isBlocked = true;
            }
        };
        busyIndicator.prototype.unBlock = function () {
            var overlayParent = document.querySelector(".block-overlay").parentElement;
            overlayParent.parentElement.removeChild(overlayParent);
            busyIndicator.isBlocked = false;
        };
        return busyIndicator;
    }());
    busyIndicator.isBlocked = false;
    fastnet.busyIndicator = busyIndicator;
})(fastnet || (fastnet = {}));
//# sourceMappingURL=busyIndicator.js.map